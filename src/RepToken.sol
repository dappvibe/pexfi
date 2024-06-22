// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IRepManager} from "./interfaces/IRepManager.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// @dev separate rep token allows multiple markets attached and rep be shared across them
contract RepToken is IRepManager, UUPSUpgradeable, AccessControlUpgradeable, ERC721BurnableUpgradeable
{
    bytes32 public constant MARKET_ROLE = keccak256("MARKET_ROLE");

    function initialize() initializer external
    {
        __ERC721_init("Reputation Token", "REP");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    function _authorizeUpgrade(address) internal onlyRole(DEFAULT_ADMIN_ROLE) override {}

    function supportsInterface(bytes4 interfaceId) public view
    override(ERC721Upgradeable, AccessControlUpgradeable)
    returns (bool) {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }
}
