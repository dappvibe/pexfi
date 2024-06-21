// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

interface IPriceOracle
{
    // @dev Get the latest ratio of (token1/token0)*100
    function getPrice(address token0, address token1) external view returns (uint64 price);
}
