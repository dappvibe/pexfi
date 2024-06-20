// SPDX-License-Identifier: UNLICENSED
// @dev This is a separate contract because UniswapV3 uses outdated Solidity version
//      TODO upgrade to UniswapV4 and merge into Market(inheritance) when they launch pools to fetch prices
//      for now Market proxies price requests to this contract
pragma solidity >=0.5.0 <0.8.0;

import {UniswapV3Oracle} from "@solarity/solidity-lib/oracles/UniswapV3Oracle.sol";

contract UniswapOracle is UniswapV3Oracle
{
    constructor(address uniswapV3Factory_) UniswapV3Oracle(uniswapV3Factory_) {}

    // @dev simplified for single pair
    function getPrice(address token0, address token1, uint24 fee, uint32 twapPeriod) external view returns (uint256 price, uint256 lastUpdateTimestamp)
    {
        address[] memory tokens = new address[](2);
        tokens[0] = token0;
        tokens[1] = token1;
        uint24[] memory fees = new uint24[](1);
        fees[0] = fee;

        return UniswapV3Oracle.getPriceOfTokenInToken(tokens, fees, 1, twapPeriod);
    }
}
