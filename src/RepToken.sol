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
    uint32 private _nextTokenId;

    mapping(uint32 => Stats) public stats;
    struct Stats {
        uint256 createdAt; // block
        uint32 upvotes;
        uint32 downvotes;
        uint64 volumeUSD;
        uint32 dealsCompleted;
        uint32 dealsExpired; // ++ when not accepted deal as offer owner
        uint32 disputesLost;
        uint32 avgPaymentTime; // in seconds
        uint32 avgReleaseTime; // in seconds
    }

    function initialize() initializer external
    {
        __ERC721_init("Reputation Token", "REP");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _nextTokenId = 1;
    }
    function _authorizeUpgrade(address) internal onlyRole(DEFAULT_ADMIN_ROLE) override {}

    function supportsInterface(bytes4 interfaceId) public view
    override(ERC721Upgradeable, AccessControlUpgradeable)
    returns (bool) {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    function register() external returns(uint32 tokenId)
    {
        tokenId = _nextTokenId;
        _mint(msg.sender, tokenId);
        _resetStats(tokenId);
        _nextTokenId++;
    }

    function _resetStats(uint32 _tokenId) private
    {
        stats[_tokenId] = Stats({
            createdAt: block.number,
            upvotes: 0,
            downvotes: 0,
            volumeUSD: 0,
            dealsCompleted: 0,
            dealsExpired: 0,
            disputesLost: 0,
            avgPaymentTime: 0,
            avgReleaseTime: 0
        });
    }
}
