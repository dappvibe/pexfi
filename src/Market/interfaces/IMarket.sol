// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./IOfferManager.sol";
import {IDealManager} from "./IDealManager.sol";
import {IRepManager} from "./IRepManager.sol";

interface IMarket is IOfferManager, IDealManager, IRepManager
{
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
