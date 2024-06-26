// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Fiats} from "../libraries/Fiats.sol";
import {Methods} from "../libraries/Methods.sol";

interface IInventory {
    function token(string memory symbol_) external view returns (IERC20Metadata);
    function fiat(string memory symbol_) external view returns (Fiats.Fiat memory);
    function method(string memory symbol_) external view returns (Methods.Method memory);
    function convert(uint amount_, string memory fromFiat_, string memory toToken_, uint denominator) external view returns (uint256);
    function getPrice(string memory token_, string memory fiat_) external view returns (uint256 $result);
}
