// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Deal.sol";

interface IMarket
{
    event TokenAdded(string indexed symbol, address indexed target, IERC20 token);
    event TokenRemoved(string indexed symbol, address indexed target);
    event FiatAdded(string indexed symbol, address indexed oracle);
    event FiatRemoved(string indexed symbol);
    event MethodAdded(string indexed name, Method method);
    event MethodRemoved(string indexed name);

    event OfferCreated(address indexed owner, string indexed crypto, string indexed fiat, Offer offer);
    event DealCreated(uint indexed offerId, address indexed mediator, Deal deal);

    struct Offer {
        uint id;
        address owner;  // TODO Support ENS in client for nicknames

        bool isSell;
        string token;
        string fiat;
        string method;
        uint16  rate;
        uint32  min;
        uint32  max;

        /**
        * @dev Single method per offer allows to close trades automatically in case of cryptocurrencies with deterministic pricing for each method.
        *      Also avoids situations when advertiser changes terms after trade is initiated saying that published price is for another method.
        *      Also it builds costs for advertisers to include a method so it serves as spam protection.
        */

        // TODO zip and store into array or somehow else allow it to be up to 256? bytes
        // this cannot be stored out-of-chain otherwise actors may change and it will be impossible to verify
        // alternatively, we could store the hash of the terms and terms itself outside of the chain
        // use sign data with metamask?
        string terms; // FIXME can it be another contract deployed by advertiser?
        uint16 paymentTimelimit; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        bool kycRequired ; // flag showing if seller mandate fiat sender to KYC (out of chain by their own means)

        // to check on execution: https://medium.com/coinmonks/testing-time-dependent-logic-in-ethereum-smart-contracts-1b24845c7f72 ?
        //bytes4 openHours; // 1 to 24 from as 1st byte, to as 2nd, and timezone as 3rd
    }

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
