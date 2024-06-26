// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../Deal.sol";
import "../libraries/Offers.sol";
import "../libraries/Methods.sol";

interface IMarket
{
    event OfferCreated(address indexed owner, string indexed crypto, string indexed fiat, Offers.Offer offer);
    event DealCreated(uint indexed offerId, address indexed mediator, Deal deal);

    /**
    * @dev Payment methods management
    */
    function fundDeal() external returns (bool);
}
