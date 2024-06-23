// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IUniswapOracle
{
    function getPriceOfTokenInToken(
        address[] memory path_,
        uint24[] memory fees_,
        uint128 amount_,
        uint32 period_
    ) external view returns (uint128, uint32);
}
