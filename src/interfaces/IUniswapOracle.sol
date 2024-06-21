// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IUniswapOracle
{
    function getPrice(address token0, address token1, uint24 fee, uint32 twapPeriod)
    external view returns
    (uint128 price, uint256 lastUpdateTimestamp);
}
