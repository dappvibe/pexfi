// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract MockUniswapV3Factory {
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool)
    {
        return address(this);
    }

    function observe(uint32[] calldata secondsAgos)
    external
    view
    returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
    {
        // WETH / USDT pool
        int56[] memory tickCumulatives = new int56[](2);
        tickCumulatives[0] = -17595288323282;
        tickCumulatives[1] = -17595346759502;
        uint160[] memory secondsPerLiquidityCumulativeX128s = new uint160[](2);
        secondsPerLiquidityCumulativeX128s[0] = 431388776603627029670683737059;
        secondsPerLiquidityCumulativeX128s[1] = 431388776750562642834933065513;
        return (tickCumulatives, secondsPerLiquidityCumulativeX128s);
    }
}
