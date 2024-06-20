// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IDealManager} from "../interfaces/IDealManager.sol";

contract DealManager is IDealManager {
    mapping(uint32 => Deal) public deal;
    uint32 private _nextDealId;

    mapping(uint32 => State) public dealState;
}
