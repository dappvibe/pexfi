// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract PexfiToken is ERC20, ERC20Permit, ERC20Burnable {
    constructor() ERC20("Pexfi P2P", "PEXFI") ERC20Permit("Pexfi P2P") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
