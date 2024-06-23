// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./IOfferManager.sol";
import {IDealManager} from "./IDealManager.sol";
import {IRepManager} from "./IRepManager.sol";

interface IMarket is IOfferManager, IDealManager, IRepManager
{
    event TokenAdded(string indexed symbol, address indexed target, Token token);
    event TokenRemoved(string indexed symbol, address indexed target);
    event FiatAdded(bytes32 indexed symbol, address indexed oracle);
    event FiatRemoved(bytes32 indexed symbol);

    struct Token {
        address target;
        string name;
        string symbol;
        uint8 decimals;
    }
}
