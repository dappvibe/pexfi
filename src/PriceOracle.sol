// SPDX-License-Identifier: UNLICENSED
// @dev This is a separate contract because UniswapV3 uses outdated Solidity version
//      TODO upgrade to UniswapV4 and merge into Market(inheritance) when they launch pools to fetch prices
//      for now Market proxies price requests to this contract
pragma solidity >=0.5.0 <0.8.0;

import {UniswapV3Oracle} from "@solarity/solidity-lib/oracles/UniswapV3Oracle.sol";
import "./interfaces/IMarket.sol";
import {IPriceOracle} from "./interfaces/IPriceOracle.sol";

contract PriceOracle is IPriceOracle, UniswapV3Oracle
{
    IMarket public market;

    constructor(
        address calldata _market,
        address calldata uniswapV3Factory_
    ) UniswapV3Oracle(uniswapV3Factory_)
    {
        market = IMarket(_market);
    }

    function getPrice(string calldata _token, string calldata _fiat) external view override returns (uint64) {
        address tokenAddress = market.tokens(_token);
        require(tokenAddress != address(0), 'token not supported');
        require(market.fiats(_fiat) != 0, 'fiat not supported');

        string memory fiat = 'USD';

        // first get token to USDT value
        (uint tokenToUsd,) = getPriceOfTokenInToken(tokenAddress, market.tokens('USDT'), 1, 0);

        return 0;
    }
}
