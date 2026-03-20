// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IChainlink} from "./IChainlink.sol";
import {IDeal} from "./IDeal.sol";
import {IOffer} from "./IOffer.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

interface IMarket {
  struct Token {
    IUniswapV3Pool pool; // address(0) disables a token
    uint8 decimals;
  }

  event OfferCreated(address owner, IERC20 token, bytes32 fiat, IOffer offer);
  event DealCreated(address indexed offerOwner, address taker, address offer, address deal, uint256 fiatAmount, bytes16 method, string terms, string paymentInstructions);

  event TokenAdded(IERC20 address_);
  event TokenRemoved(IERC20 address_);
  event FiatAdded(bytes32 symbol, IChainlink feed);
  event FiatRemoved(bytes32 symbol);
  event MethodAdded(bytes16 name, uint index);
  event MethodsDisabledMask(uint mask);

  error InvalidArgument();
  error UnauthorizedAccount(address account);
  error InvalidToken(IERC20 token);
  error InvalidFiat(bytes32 fiat);
  error InvalidMethod(uint256 method);
  error UnknownOffer();

  function finder() external view returns (FinderInterface);
  function fee() external view returns (uint8);

  function offers(address offer_) external view returns (bool);
  function deals(address deal_) external view returns (bool);

  function tokens(IERC20 address_) external view returns (IUniswapV3Pool pool, uint8 decimals);
  function fiats(bytes3 symbol_) external view returns (IChainlink);
  function methods(uint256 index) external view returns (bytes16);
  function disabledMethodsMask() external view returns (uint256);

  function createOffer(IOffer.OfferParams calldata params) external;
  function addDeal(IDeal deal, uint256 fiatAmount, bytes16 method, string calldata terms, string calldata paymentInstructions) external;
  function fundDeal() external;

  function getPrice(IERC20 token_, bytes3 fiat_) external view returns (uint256 price);
  function convert(
    uint256 amount_,
    bytes3 fromFiat_,
    IERC20 toToken_,
    uint256 denominator
  ) external view returns (uint256 amount);
}
