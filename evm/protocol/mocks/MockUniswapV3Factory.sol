// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

contract PoolBTC {
  address public token0;
  address public token1;

  constructor(address _token0, address _token1) {
    token0 = _token0;
    token1 = _token1;
  }

  function observe(uint32[] calldata secondsAgos) external view
  returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
  {
    // BTC / USDC pool
    int56[] memory tickCumulatives = new int56[](2);
    tickCumulatives[0] = - 9040098714235;
    tickCumulatives[1] = - 9040079462965;
    uint160[] memory secondsPerLiquidityCumulativeX128s = new uint160[](2);
    secondsPerLiquidityCumulativeX128s[0] = 21746648482736078136077099395084223508335445413;
    secondsPerLiquidityCumulativeX128s[1] = 21746648482736078226820428347587393185871729114;
    return (tickCumulatives, secondsPerLiquidityCumulativeX128s);
  }
}

contract PoolETH {
  address public token0;
  address public token1;

  constructor(address _token0, address _token1) {
    token0 = _token0;
    token1 = _token1;
  }

  function observe(uint32[] calldata secondsAgos) external view
  returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)
  {
    // WETH / USDC pool
    int56[] memory tickCumulatives = new int56[](2);
    tickCumulatives[0] = 12276842837088;
    tickCumulatives[1] = 12276898814988;
    uint160[] memory secondsPerLiquidityCumulativeX128s = new uint160[](2);
    secondsPerLiquidityCumulativeX128s[0] = 2213225794400229725653573790220191;
    secondsPerLiquidityCumulativeX128s[1] = 2213225802448719423447484547581543;
    return (tickCumulatives, secondsPerLiquidityCumulativeX128s);
  }
}
