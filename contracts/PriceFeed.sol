// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IPriceFeed} from "./interfaces/IPriceFeed.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// @dev Provides rates for currencies not available in chainlink
// @dev Deploy one contract per fiat currency (except for USD)
contract PriceFeed is IPriceFeed, Ownable
{
    using Strings for string;

    // Chainlink compatible
    uint8 public decimals = 8;
    string public description;
    uint public version = 1;

    uint public latestTimestamp;
    int private _rate;

    constructor(string memory name_) Ownable(msg.sender) {
        description = string.concat(name_, " / USD");
    }

    function set(int256 rate) external onlyOwner
    {
        _rate = rate;
        latestTimestamp = block.timestamp;
    }

    function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, _rate, 0, latestTimestamp, 1);
    }
}
