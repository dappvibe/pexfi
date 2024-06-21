// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockWBTC is ERC20
{
    constructor() ERC20("Mock Bitcoin", "WBTC")
    {
        _mint(msg.sender, 10);
    }

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}
