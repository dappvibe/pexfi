// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IPriceOracle
{
    // @dev USDT is used as a base currency for all fiats
    // @return (fiat / token) * 100
    function getPrice(string calldata _token, string calldata _fiat) external view returns (uint64);
}
