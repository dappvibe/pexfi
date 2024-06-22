// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./IOfferManager.sol";
import {IDealManager} from "./IDealManager.sol";
import {IRepManager} from "./IRepManager.sol";

interface IMarket is IOfferManager, IDealManager, IRepManager
{
    struct Token {
        address target;
        string name;
        string symbol;
        uint8 decimals;
    }
}
