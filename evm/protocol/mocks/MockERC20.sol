// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MockERC20 is ERC20
{
    using Strings for string;

    uint8 private immutable _decimals;

    constructor(string memory $symbol, uint8 $decimals)
    ERC20(string.concat('Mock', $symbol), $symbol)
    {
        _decimals = $decimals;
        giveme(type(uint256).max);
    }

    function giveme(uint amount) public
    {
        _mint(msg.sender, uint(amount));
    }

    function decimals() public view override returns (uint8)
    {
        return _decimals;
    }
}
