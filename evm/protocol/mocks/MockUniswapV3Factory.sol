// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract PoolBTC {
    function observe(uint32[] calldata secondsAgos) external view
    returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
    {
        // BTC / USDC pool
        int56[] memory tickCumulatives = new int56[](2);
        tickCumulatives[0] = -9040098714235;
        tickCumulatives[1] = -9040079462965;
        uint160[] memory secondsPerLiquidityCumulativeX128s = new uint160[](2);
        secondsPerLiquidityCumulativeX128s[0] = 21746648482736078136077099395084223508335445413;
        secondsPerLiquidityCumulativeX128s[1] = 21746648482736078226820428347587393185871729114;
        return (tickCumulatives, secondsPerLiquidityCumulativeX128s);
    }
}

contract PoolETH {
    function observe(uint32[] calldata secondsAgos) external view
    returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
    {
        // WETH / USDC pool
        int56[] memory tickCumulatives = new int56[](2);
        tickCumulatives[0] = -17595288323282;
        tickCumulatives[1] = -17595346759502;
        uint160[] memory secondsPerLiquidityCumulativeX128s = new uint160[](2);
        secondsPerLiquidityCumulativeX128s[0] = 431388776603627029670683737059;
        secondsPerLiquidityCumulativeX128s[1] = 431388776750562642834933065513;
        return (tickCumulatives, secondsPerLiquidityCumulativeX128s);
    }
}

contract MockUniswapV3Factory
{
    mapping(address tokenA => address pool) public pools;

    // original method
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool)
    {
        return pools[tokenA];
    }

    function setPool(address tokenA, address pool) external
    {
        pools[tokenA] = pool;
    }
}
