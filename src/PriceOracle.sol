// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@solarity/solidity-lib/oracles/UniswapV3Oracle.sol";
import {IPriceOracle} from "./interfaces/IPriceOracle.sol";

/**
 * @dev This is a separate contract because:
 *      1. Uniswap V3 uses solidity <0.8
 *      2. It has different access control to update prices.
 *      3. Depends on 3rd party contracts and must be mocked in tests.
 */
contract PriceOracle is IPriceOracle, UniswapV3Oracle
{
    // @dev helper function to convert symbol to address
    mapping(string => address) public getAddress;

    address private owner;

    constructor(
        address _uniswapV3Factory,
        string[] memory _symbols,
        address[] memory _addresses
    ) UniswapV3Oracle(_uniswapV3Factory)
    {
        owner = msg.sender;

        getAddress["USD"] = address(840);
        getAddress["GBP"] = address(826);
        getAddress["EUR"] = address(978);
        getAddress["JPY"] = address(392);
        getAddress["KRW"] = address(410);
        getAddress["CNY"] = address(156);
        getAddress["AUD"] = address(36);
        getAddress["CAD"] = address(124);
        getAddress["CHF"] = address(756);
        getAddress["ARS"] = address(32);
        getAddress["PHP"] = address(608);
        getAddress["NZD"] = address(554);
        getAddress["SGD"] = address(702);
        getAddress["NGN"] = address(566);
        getAddress["ZAR"] = address(710);
        //getAddress["RUB"] = address(643);
        getAddress["INR"] = address(356);
        getAddress["BRL"] = address(986);

        for(uint8 i = 0; i < _symbols.length; i++) {
            getAddress[_symbols[i]] = _addresses[i];
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "denied");
        _;
    }

    // @param _token address of ERC20 token
    // @param _fiat ISO 4217 code of fiat currency
    function getPrice(address _token, address _fiat) external view override returns (uint64 price)
    {
        price = getPriceInUsdt(_token);

        // convert USD to other currency
        if (_fiat != getAddress['USD']) {

        }

        return uint64(price);
    }

    function getPriceInUsdt(address _token) public view returns (uint64 price)
    {
        address USDT = getAddress['USDT'];
        require(USDT != address(0), 'No USDT address');

        address[] memory tokens = new address[](2);
        tokens[0] = _token;
        tokens[1] = USDT;
        uint24[] memory fees = new uint24[](1);
        fees[0] = 3000; // FIXME other fee pools

        (uint128 uni,) = getPriceOfTokenInToken(tokens, fees, 3000, 300); // 5 min TWAP

        return uint64(uni);
    }
}
