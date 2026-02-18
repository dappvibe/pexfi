// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./PexfiToken.sol";

contract PexfiVault is ERC4626, ERC20Permit, Ownable {
    constructor(PexfiToken asset_)
        ERC4626(asset_)
        ERC20("Staked Pexfi P2P", "sPEXFI")
        ERC20Permit("Staked Pexfi P2P")
        Ownable(msg.sender)
    {}

    function decimals() public view override(ERC4626, ERC20) returns (uint8) {
        return super.decimals();
    }
}
