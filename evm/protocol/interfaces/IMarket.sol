// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {IOffer} from "./IOffer.sol";
import {IDeal} from "./IDeal.sol";
import {IProfile} from "./IProfile.sol";
import {IChainlink} from "./IChainlink.sol";
import {Tokens} from "../libraries/Tokens.sol";
import {Methods} from "../libraries/Methods.sol";

interface IMarket {
    error InvalidArgument(string name);
    error UnauthorizedAccount(address account);
    error InvalidToken(bytes8 token);
    error InvalidFiat(bytes3 fiat);
    error InvalidMethod(bytes16 method);

    event OfferCreated(address indexed owner, bytes8 indexed token, bytes3 indexed fiat, IOffer offer);
    event DealCreated(
        address indexed offerOwner,
        address indexed taker,
        address indexed offer,
        address deal,
        string terms,
        string paymentInstructions
    );

    function initialize(address finder_) external;

    function createOffer(IOffer.OfferParams calldata params) external;

    function hasOffer(address offer_) external view returns (bool);

    function profile() external view returns (IProfile);

    function feeCollector() external view returns (address);

    function oracle() external view returns (address);

    function addDeal(IDeal deal, string calldata terms, string calldata paymentInstructions) external;

    function fundDeal() external;

    function setFee(uint16 fee_) external;

    function convert(
        uint256 amount_,
        bytes3 fromFiat_,
        bytes8 toToken_,
        uint256 denominator
    ) external view returns (uint256 amount);

    function getPrice(bytes8 token_, bytes3 fiat_) external view returns (uint256 price);

    function token(bytes8 symbol_) external view returns (Tokens.Token memory);

    function getTokens() external view returns (bytes8[] memory);

    function fiat(bytes3 symbol_) external view returns (IChainlink);

    function getFiats() external view returns (bytes3[] memory);

    function method(bytes16 name_) external view returns (Methods.Method memory);

    function getMethods() external view returns (bytes16[] memory);

    function fee() external view returns (uint16);

    function finder() external view returns (FinderInterface);
}
