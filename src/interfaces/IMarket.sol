// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./IOfferManager.sol";
import {IDealManager} from "./IDealManager.sol";
import {IRepManager} from "./IRepManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMarket is IOfferManager, IDealManager, IRepManager
{
    event TokenAdded(bytes32 indexed symbol, address indexed target, IERC20 token);
    event TokenRemoved(bytes32 indexed symbol, address indexed target);
    event FiatAdded(bytes32 indexed symbol, address indexed oracle);
    event FiatRemoved(bytes32 indexed symbol);
}
