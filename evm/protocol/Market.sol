// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";

import {FullMath} from "./libraries/FullMath.sol";
import {TickMath} from "./libraries/TickMath.sol";
import {Tokens} from "./libraries/Tokens.sol";
import {Methods} from "./libraries/Methods.sol";
import {Fiats} from "./libraries/Fiats.sol";


import {IMarket} from "./interfaces/IMarket.sol";
import {IOffer} from "./interfaces/IOffer.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {IProfile} from "./interfaces/IProfile.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import {IChainlink} from "./interfaces/IChainlink.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract Market is IMarket, OwnableUpgradeable, UUPSUpgradeable
{
  using SafeERC20 for IERC20Metadata;
  using Tokens  for Tokens.Storage;
  using Fiats   for Fiats.Storage;
  using Methods for Methods.Storage;

  Tokens.Storage  private tokens;
  Fiats.Storage   private fiats;
  Methods.Storage private methods;

  mapping(address => bool) private offers;
  mapping(address => bool) private deals;

  FinderInterface public finder;
  uint16 public fee;

  function initialize(address finder_) initializer external {
    __Ownable_init(msg.sender);
    finder = FinderInterface(finder_);
    fee = 100;
  }

  function _authorizeUpgrade(address) internal onlyOwner override {}

  function createOffer(IOffer.OfferParams calldata params) external {
    require(params.rate > 0, "rate");
    require(params.limits.min < params.limits.max, "minmax");

    getPrice(params.token, params.fiat);
    method(params.method);

    address impl = finder.getImplementationAddress(FinderConstants.OfferImplementation);
    IOffer offer = IOffer(Clones.clone(impl));
    offer.initialize(msg.sender, params);

    require(!offers[address(offer)], "exists");
    offers[address(offer)] = true;
    emit OfferCreated(offer.owner(), offer.token(), offer.fiat(), offer);
  }

  function hasOffer(address offer_) external view returns (bool) {
    return offers[offer_];
  }

  function profile() public view returns (IProfile) {
    return IProfile(finder.getImplementationAddress(FinderConstants.Profile));
  }

  function uniswap() internal view returns (IUniswapV3Factory) {
    return IUniswapV3Factory(finder.getImplementationAddress(FinderConstants.Uniswap));
  }

  function feeCollector() public view returns (address) {
    return finder.getImplementationAddress(FinderConstants.FeeCollector);
  }

  function oracle() public view returns (address) {
    return finder.getImplementationAddress(FinderConstants.Oracle);
  }

  function addDeal(IDeal deal, string calldata terms, string calldata paymentInstructions) external {
    require(offers[msg.sender], IMarket.UnauthorizedAccount(msg.sender));
    deals[address(deal)] = true;

    IOffer offer = IOffer(deal.offer());
    emit DealCreated(offer.owner(), deal.taker(), address(offer), address(deal), terms, paymentInstructions);
    profile().grantRole("DEAL_ROLE", address(deal));
  }

  /// @dev users provide allowance once to the market
  function fundDeal() external {
    require(deals[msg.sender], UnauthorizedAccount(msg.sender));

    IDeal $deal = IDeal(msg.sender);
    require($deal.state() == IDeal.State.Accepted, "not accepted");

    IOffer $offer = IOffer($deal.offer());
    IERC20Metadata $token = token($offer.token()).api;

    address seller = $offer.isSell() ? $offer.owner() : $deal.taker();
    $token.safeTransferFrom(seller, address($deal), $deal.tokenAmount());
  }

  function setFee(uint16 fee_) public onlyOwner {fee = fee_;}

  /// @param amount_ must have 6 decimals as a fiat amount
  /// @param denominator ratio (4 decimal) to apply to resulting amount
  /// @return amount of tokens in precision of given token // FIXME precision is not respected
  function convert(uint amount_, bytes3 fromFiat_, bytes8 toToken_, uint denominator)
  public view
  returns (uint256 amount)
  {
    if (fromFiat_ == bytes3("USD") && toToken_ == bytes8("USDC"))
      return FullMath.mulDiv(amount_, 10 ** 4, denominator);

    uint decimals = tokens.get(toToken_).decimals;
    amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
    return FullMath.mulDiv(amount, 10 ** 4, denominator);
  }

  /// @return price with 6 decimals
  function getPrice(bytes8 token_, bytes3 fiat_) public view returns (uint256 price) {
    if (token_ != bytes8("USDC")) {
      price = _uniswapRateForUSD(tokens.get(token_));
    } else {
      price = 10 ** 6;
    }

    if (fiat_ != bytes3("USD")) {
      (, int $fiatToUSD,,,) = fiats.get(fiat_).latestRoundData();
      require($fiatToUSD > 0, "bad oracle price");
      price = price * 10 ** 8 / uint($fiatToUSD);
    }
  }

  function token(bytes8 symbol_) public view returns (Tokens.Token memory) {return tokens.get(symbol_);}

  function getTokens() public view returns (bytes8[] memory) {return tokens.list();}

  function fiat(bytes3 symbol_) public view returns (IChainlink) {return fiats.get(symbol_);}

  function getFiats() public view returns (bytes3[] memory) {return fiats.list();}

  function method(bytes16 name_) public view returns (Methods.Method memory) {return methods.get(name_);}

  function getMethods() public view returns (bytes16[] memory) {return methods.list();}

  function addTokens(address[] calldata tokens_, uint16 uniswapPoolFee) external onlyOwner {
    for (uint i = 0; i < tokens_.length; i++) {
      tokens.add(tokens_[i], uniswapPoolFee);
    }
  }

  function removeTokens(bytes8[] calldata token_) external onlyOwner {
    for (uint i = 0; i < token_.length; i++) {
      tokens.remove(token_[i]);
    }
  }

  function addFiats(Fiats.Fiat[] calldata fiats_) external onlyOwner {
    for (uint i = 0; i < fiats_.length; i++) {
      fiats.add(fiats_[i]);
    }
  }

  function removeFiats(bytes3[] calldata fiat_) external onlyOwner {
    for (uint i = 0; i < fiat_.length; i++) {
      fiats.remove(fiat_[i]);
    }
  }

  function addMethods(bytes16[] calldata names_, Methods.Group[] calldata groups_) external onlyOwner {
    for (uint i = 0; i < names_.length; i++) {
      methods.add(names_[i], groups_[i]);
    }
  }

  function removeMethods(bytes16[] calldata names_) external onlyOwner {
    for (uint i = 0; i < names_.length; i++) {
      methods.remove(names_[i]);
    }
  }

  /// @return price of token_ in USDC (6 decimals)
  function _uniswapRateForUSD(Tokens.Token storage token_) internal view returns (uint) {
    IUniswapV3Pool pool = IUniswapV3Pool(uniswap().getPool(
      address(token_.api),
      address(tokens.get(bytes8("USDC")).api),
      token_.uniswapPoolFee
    ));

    uint32[] memory secs = new uint32[](2);
    secs[0] = 300;
    secs[1] = 0;
    (int56[] memory tickCumulatives,) = pool.observe(secs);
    int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
    uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(int24(tickCumulativesDelta / 300));

    return FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token_.decimals, 1 << 192);
  }
}
