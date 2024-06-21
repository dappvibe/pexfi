// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IUniswapOracle} from "../interfaces/IUniswapOracle.sol";

contract MockUniswapOracle is IUniswapOracle
{
    function getPrice(address token0, address token1, uint24 fee, uint32 twapPeriod)
    external pure
    returns (uint128 price, uint256 lastUpdateTimestamp)
    {
        // ETH / USDT
        return (350050, 1);
    }
}
