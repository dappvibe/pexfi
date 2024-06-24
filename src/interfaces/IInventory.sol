// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IInventory {
    event TokenAdded(string indexed symbol, address indexed target, address token);
    event TokenRemoved(string indexed symbol, address indexed target);
    event FiatAdded(string indexed symbol, address indexed oracle);
    event FiatRemoved(string indexed symbol);

    function getPrice(string memory token_, string memory fiat_) external view returns (uint256 $result);
    function getFiatToUSD(string memory fiat_) external view returns (uint);
}
