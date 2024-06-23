// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MockERC20 is ERC20
{
    using Strings for string;

    uint8 private _decimals;

    constructor(string memory $symbol, uint8 $decimals)
    ERC20(string.concat('Mock', $symbol), $symbol)
    {
        _decimals = $decimals;
        _mint(msg.sender, type(uint256).max);
    }

    function decimals() public view override returns (uint8)
    {
        return _decimals;
    }
}
