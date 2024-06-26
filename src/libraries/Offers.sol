// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library Offers
{
    using EnumerableSet for EnumerableSet.UintSet;

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
        uint acceptanceTime; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        bool kycRequired ; // flag showing if seller mandate fiat sender to KYC (out of chain by their own means)

        // to check on execution: https://medium.com/coinmonks/testing-time-dependent-logic-in-ethereum-smart-contracts-1b24845c7f72 ?
        //bytes4 openHours; // 1 to 24 from as 1st byte, to as 2nd, and timezone as 3rd
    }

    struct Storage {
        uint length;
        mapping(uint => Offer) all;
        mapping(bytes32 token => mapping(bytes32 fiat => mapping(bytes32 method => EnumerableSet.UintSet))) sell;
        mapping(bytes32 token => mapping(bytes32 fiat => mapping(bytes32 method => EnumerableSet.UintSet))) buy;
    }

    function add(Storage storage self, Offer memory offer)
    internal
    returns (Offer storage) {
        offer.id = self.length + 1;
        self.all[offer.id] = offer;

        bytes32 token   = bytes32(bytes(offer.token));
        bytes32 fiat    = bytes32(bytes(offer.fiat));
        bytes32 method  = bytes32(bytes(offer.method));

        if (offer.isSell) {
            self.sell[token][fiat][''].add(offer.id);
            self.sell[token][fiat][method].add(offer.id);
        } else {
            self.buy[token][fiat][''].add(offer.id);
            self.buy[token][fiat][method].add(offer.id);
        }

        self.length++;
        return self.all[offer.id];
    }

    function list(Storage storage self, bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    internal view
    returns (Offer[] memory offers)
    {
        bytes32 token   = bytes32(bytes(token_));
        bytes32 fiat    = bytes32(bytes(fiat_));
        bytes32 method  = bytes32(bytes(method_));

        EnumerableSet.UintSet storage offersSet = isSell_ ? self.sell[token][fiat][method] : self.buy[token][fiat][method];

        uint length = offersSet.length();
        offers = new Offer[](length);
        for (uint i = 0; i < length; i++) {
            offers[i] = self.all[offersSet.at(i)];
        }
    }
}
