// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Fiat} from "../../enums/fiats.sol";
import "../../enums/countries.sol";

interface IOfferManager
{
    event OfferCreated(bool indexed isSell, address indexed crypto, Fiat indexed fiat, uint24 offerId, Offer offer);

    event MethodAdded(uint16 indexed id, Country indexed country, Method method);
    event MethodRemoved(uint16 indexed id);

    struct Offer {
        address owner;  // Support ENS in client for nicknames

        bool    isSell;
        address crypto;
        uint    priceRatio; // TODO X96?? X4??
        Fiat    fiat;
        uint    fiatMin;
        uint    fiatMax;

        /**
        * @dev Single method per offer allows to close trades automatically in case of cryptocurrencies with deterministic pricing for each method.
        *      Also avoids situations when advertiser changes terms after trade is initiated saying that published price is for another method.
        *      Also it builds costs for advertisers to include a method so it serves as spam protection.
        */
        Method method;

        // TODO zip and store into array or somehow else allow it to be up to 256? bytes
        // this cannot be stored out-of-chain otherwise actors may change and it will be impossible to verify
        // alternatively, we could store the hash of the terms and terms itself outside of the chain
        // use sign data with metamask?
        string terms; // FIXME can it be another contract deployed by advertiser?
        uint16 paymentTimelimit; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        bool kycRequired ; // flag showing if seller mandate fiat sender to KYC (out of chain by their own means)

        // to check on execution: https://medium.com/coinmonks/testing-time-dependent-logic-in-ethereum-smart-contracts-1b24845c7f72 ?
        //bytes4 openHours; // 1 to 24 from as 1st byte, to as 2nd, and timezone as 3rd

        bool active;
    }

    struct OfferCreateParams {
        bool isSell;
        address crypto; // ERC20
        Fiat fiat;
        uint price;
        uint min;
        uint max;
        uint16 method;
        uint16 paymentTimeLimit; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        string terms; // FIXME can it be another contract deployed by advertiser?
    }
    function offerCreate(OfferCreateParams calldata _params) external returns(uint);

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
        Country country;
    }

    function methodAdd(string calldata _name, MethodGroup _group, Country _country) external returns(uint16);
    function methodRemove(uint16 _methodId) external;
}
