// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../Deal.sol";
import "../libraries/Offers.sol";

interface IMarket
{
    event MethodAdded(string indexed name, Method method);
    event MethodRemoved(string indexed name);

    event OfferCreated(address indexed owner, string indexed crypto, string indexed fiat, Offers.Offer offer);
    event DealCreated(uint indexed offerId, address indexed mediator, Deal deal);

    /**
    * @dev Payment methods management
    */
    enum MethodGroup {
        Other,  // undefined
        Crypto, // other chains, mediation can be automated
        Cash,   // anonymous cash delivery to ATM or otherwise
        Bank    // any regulated KYC'ed transfer entity
    }
    struct Method {
        string name;
        MethodGroup group;
        //Country country;
    }

    function fundDeal() external returns (bool);
}
