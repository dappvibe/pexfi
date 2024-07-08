// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "../Deal.sol";
import "../libraries/Offers.sol";
import "../libraries/Methods.sol";
import "../interfaces/IRepToken.sol";
import "../libraries/Fiats.sol";

interface IMarket
{
    event OfferCreated(address indexed owner, string indexed crypto, string indexed fiat, Offers.Offer offer);
    event DealCreated(address indexed offerOwner, address indexed taker, uint indexed offerId, address deal);

    /**
    * @dev Payment methods management
    */
    function fundDeal() external returns (bool);
    function repToken() external view returns (IRepToken);

    function token(string memory symbol_) external view returns (IERC20Metadata);
    function fiat(string memory symbol_) external view returns (Fiats.Fiat memory);
    function method(string memory symbol_) external view returns (Methods.Method memory);
    function convert(uint amount_, string memory fromFiat_, string memory toToken_, uint denominator) external view returns (uint256);
    function getPrice(string memory token_, string memory fiat_) external view returns (uint256 $result);
}
