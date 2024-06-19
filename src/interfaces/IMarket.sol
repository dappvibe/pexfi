// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../enums/countries.sol";
import "../enums/fiats.sol";
import "../oracles/PaymentMethodOracle.sol";

uint8 constant MAX_PAYMENT_METHODS = 1;

interface IMarket
{
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
        string deliveryMethod;

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

    event OfferCreated(bool indexed isSell, address indexed crypto, Fiat indexed fiat, uint24 offerId, Offer offer);

    struct Rep {
        address owner;
        uint volume; // gwei equivalent volume transacted
        uint successfulCount;
        uint canceledCount;
        uint disputedCount;
        uint cancelledCount;
        uint abandonedCount;
        uint score;
        uint avgPaymentTime;
        uint avgReleaseTime;
        mapping(address => string) feedback; // address's opinion
    }
}
