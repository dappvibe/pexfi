// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IInventory {
    event TokenAdded(string indexed symbol, address indexed target, address token);
    event TokenRemoved(string indexed symbol, address indexed target);
    event FiatAdded(string indexed symbol, address indexed oracle);
    event FiatRemoved(string indexed symbol);

    function token(bytes32 symbol_) external view returns (IERC20Metadata);
    function convert(uint amount_, string memory fromFiat_, string memory toToken_) external view returns (uint256);
    function getPrice(string memory token_, string memory fiat_) external view returns (uint256 $result);
}
