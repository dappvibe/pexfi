// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

interface IFeeCollector {
  event Buyback(address indexed token, uint256 amountIn, uint256 amountPexfiOut);

  function buyback(address token, uint24 fee) external payable;
}
