// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

import {IPriceOracle} from "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle
{
    function getPrice(address token0, address token1)
    external pure override
    returns (uint64 price)
    {
        // ETH / USDT
        return (350050);
    }
}
