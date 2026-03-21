// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";

import {FullMath} from "./libraries/FullMath.sol";
import {TickMath} from "./libraries/TickMath.sol";

import {IMarket} from "./interfaces/IMarket.sol";
import {IOffer} from "./interfaces/IOffer.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {IProfile} from "./interfaces/IProfile.sol";
import {Services} from "./libraries/Services.sol";
import {IChainlink} from "./interfaces/IChainlink.sol";
import {Finder} from "./Finder.sol";

contract Market is IMarket, Finder, UUPSUpgradeable
{
  using SafeERC20 for IERC20;

  mapping(IERC20  => Token)      public tokens;

  // @dev 3 bytes are packed in Offer storage even though here it is 32 bytes
  mapping(bytes3  => IChainlink) public fiats;

  /**
   * Offers may accept multiple methods.
   */
  bytes16[] public methods;
  uint256 public disabledMethodsMask;

  uint8 public fee;
  mapping(address => bool) public offers;
  mapping(address => bool) public deals;

  address public immutable USDC;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor(address usdc_) {
    USDC = usdc_;
    _disableInitializers();
  }

  function initialize() initializer external {
    __Ownable_init(msg.sender);
  }
  function _authorizeUpgrade(address) internal onlyOwner override {}

  /**
   * Admin configuration methods.
   */
  function setFee(uint8 fee_) public onlyOwner {fee = fee_;}

  function addToken(IERC20 address_, Token calldata token_) external onlyOwner {
    tokens[address_] = token_;
    emit TokenAdded(address_);
  }
  function removeToken(IERC20 address_) external onlyOwner {
    delete tokens[address_];
    emit TokenRemoved(address_);
  }

  function addFiat(bytes3 symbol_, IChainlink chainlink_) external onlyOwner {
    fiats[symbol_] = chainlink_;
    emit FiatAdded(symbol_, chainlink_);
  }
  function removeFiat(bytes3 symbol_) external onlyOwner {
    delete fiats[symbol_];
    emit FiatRemoved(symbol_);
  }

  function addMethods(bytes16[] calldata names_) external onlyOwner {
    for (uint i = 0; i < names_.length; i++) {
      methods.push(names_[i]);
      emit MethodAdded(names_[i], methods.length - 1);
    }
  }
  function disableMethods(uint256 mask) external onlyOwner {
    disabledMethodsMask |= mask;
    emit MethodsDisabledMask(disabledMethodsMask);
  }
  function enableMethods(uint256 mask) external onlyOwner {
    disabledMethodsMask &= ~mask;
    emit MethodsDisabledMask(disabledMethodsMask);
  }

  /**
   * Offers/Deals Registry.
   */
  function createOffer(IOffer.OfferParams calldata params) external {
    if (address(tokens[params.token].pool) == address(0)) revert InvalidToken(params.token);
    if (address(fiats[params.fiat]) == address(0))        revert InvalidFiat(params.fiat);
    if (params.methods <= 0)                              revert InvalidMethod(params.methods);
    if ((params.methods & disabledMethodsMask) != 0)      revert InvalidMethod(params.methods & disabledMethodsMask);
    if (params.rate <= 0)                                 revert IOffer.InvalidRate();
    if (params.limits.min >= params.limits.max)           revert IOffer.InvalidLimits();

    address impl = interfacesImplemented[Services.OfferImplementation];
    IOffer offer = IOffer(Clones.clone(impl));
    offer.initialize(msg.sender, params);

    offers[address(offer)] = true;

    emit OfferCreated(msg.sender, params.token, params.fiat, offer);
  }

  function addDeal(IDeal deal, uint256 fiatAmount, bytes16 method, string calldata terms, string calldata paymentInstructions) external {
    require(offers[msg.sender], UnauthorizedAccount(msg.sender));
    deals[address(deal)] = true;

    IOffer offer = IOffer(deal.offer());
    emit DealCreated(offer.owner(), deal.taker(), address(offer), address(deal), fiatAmount, method, terms, paymentInstructions);
  }

  /// @dev Method is in Market so that users provide allowance in single place instead of each Offer
  function fundDeal() external {
    require(deals[msg.sender], UnauthorizedAccount(msg.sender));

    IDeal deal = IDeal(msg.sender);
    require(deal.state() == IDeal.State.Accepted, IDeal.ActionNotAllowedInThisState(IDeal.State.Accepted));

    IOffer offer = IOffer(deal.offer());
    IERC20 token = IERC20(offer.token());

    address seller = offer.isSell() ? offer.owner() : deal.taker();
    token.safeTransferFrom(seller, address(deal), deal.tokenAmount());
  }

  /**
   * Uniswap prices synchronization methods.
   */

  /// @param amount_ must have 6 decimals as a fiat amount
  /// @param denominator ratio (4 decimal) to apply to resulting amount
  /// @return amount of tokens in precision of given token
  function convert(uint amount_, bytes3 fromFiat_, IERC20 toToken_, uint denominator)
  public view
  returns (uint256 amount)
  {
    if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)
      return FullMath.mulDiv(amount_, 10 ** 4, denominator);

    uint decimals = tokens[toToken_].decimals;
    amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
    return FullMath.mulDiv(amount, 10 ** 4, denominator);
  }

  /// @return price with 6 decimals
  function getPrice(IERC20 token_, bytes3 fiat_) public view returns (uint256 price) {
    // first fetch market TWAP for Uniswap pool of token/USDC
    if (address(token_) != USDC) {
      Token memory token = tokens[token_];
      uint32[] memory secs = new uint32[](2);
      secs[0] = 300;
      secs[1] = 0;
      (int56[] memory tickCumulatives,) = token.pool.observe(secs);
      int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];

      // Fix Solidity's negative division rounding
      int24 meanTick = int24(tickCumulativesDelta / 300);
      if (tickCumulativesDelta < 0 && (tickCumulativesDelta % 300 != 0)) {
        meanTick--;
      }

      uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(meanTick);
      uint256 ratioX192 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);

      // 2. Check token sorting to determine math direction
      address token0 = IUniswapV3Pool(token.pool).token0();
      if (address(token_) == token0) {
        // price of token_ in USDC (6 decimals)
        price = FullMath.mulDiv(ratioX192, 10 ** token.decimals, 1 << 192);
      } else {
        price = FullMath.mulDiv(1 << 192, 10 ** token.decimals, ratioX192);
      }
    } else {
      price = 10 ** 6;
    }

    if (fiat_ != bytes3("USD")) { // 0 is USD
      (, int $fiatToUSD,,,) = fiats[fiat_].latestRoundData();
      require($fiatToUSD > 0, InvalidArgument());
      price = price * 10 ** 8 / uint($fiatToUSD);
    }
  }
}
