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
    uint8 decimals;
    IUniswapV3Pool pool; // address(0) disables a token
  }

  error InvalidArgument();

  error UnauthorizedAccount(address account);
  error InvalidToken(IERC20 token);
  error InvalidFiat(bytes3 fiat);
  error InvalidMethod(uint256 method);
  error UnknownOffer();

  event OfferCreated(address owner, IERC20 token, bytes3 fiat, IOffer offer);
  event DealCreated(
    address indexed offerOwner,
    address indexed taker,
    address indexed offer,
    address deal,
    string terms,
    string paymentInstructions
  );
  event TokenAdded(IERC20 address_);
  event TokenRemoved(IERC20 address_);
  event FiatAdded(bytes3 symbol, IChainlink feed);
  event FiatRemoved(bytes3 symbol);
  event MethodAdded(bytes16 name);
  event MethodsDisabledMask(uint mask);

  function initialize(address finder_) external;

  function createOffer(IOffer.OfferParams calldata params) external;

  function offers(address offer_) external view returns (bool);

  function addDeal(IDeal deal, string calldata terms, string calldata paymentInstructions) external;

  function fundDeal() external;

  function setFee(uint8 fee_) external;

  function convert(
    uint256 amount_,
    bytes3 fromFiat_,
    IERC20 toToken_,
    uint256 denominator
  ) external view returns (uint256 amount);

  function getPrice(IERC20 token_, bytes3 fiat_) external view returns (uint256 price);

  function tokens(IERC20 address_) external view returns (uint8 decimals, IUniswapV3Pool pool);

  function fiats(bytes3 symbol_) external view returns (IChainlink);

  function methods(uint256 index) external view returns (bytes16);

  function fee() external view returns (uint8);

  function finder() external view returns (FinderInterface);
}
