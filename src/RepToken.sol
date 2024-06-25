// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IRepToken} from "./interfaces/IRepToken.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// @dev separate rep token allows multiple markets attached and rep be shared across them
contract RepToken is IRepToken, UUPSUpgradeable, AccessControlUpgradeable, ERC721BurnableUpgradeable
{
    struct Stats {
        uint32 createdAt;
        uint32 upvotes;
        uint32 downvotes;
        uint64 volumeUSD;       // TODO
        uint32 dealsCompleted;
        uint32 dealsExpired;    // TODO ++ when not accepted deal as offer owner
        uint32 disputesLost;    // TODO
        uint32 avgPaymentTime;  // TODO
        uint32 avgReleaseTime;  // TODO
    }
    mapping(uint => Stats) public stats;
    uint private _nextTokenId;

    mapping(address owner => uint) public ownerToTokenId;

    bytes32 internal constant MARKET_ROLE = "MARKET_ROLE";
    bytes32 internal constant DEAL_ROLE = "DEAL_ROLE";

    function initialize() initializer external
    {
        __ERC721_init("Reputation Token", "REP");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(DEAL_ROLE, MARKET_ROLE);
        _nextTokenId = 1;
    }
    function _authorizeUpgrade(address) internal onlyRole(DEFAULT_ADMIN_ROLE) override {}

    function supportsInterface(bytes4 interfaceId) public view
    override(IERC165, ERC721Upgradeable, AccessControlUpgradeable)
    returns (bool) {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlUpgradeable.supportsInterface(interfaceId);
    }

    function register() external returns(uint tokenId)
    {
        tokenId = _nextTokenId;
        _mint(msg.sender, tokenId);
        _resetStats(tokenId);
        stats[tokenId].createdAt = uint32(block.timestamp);
        ownerToTokenId[msg.sender] = tokenId;
        _nextTokenId++;
    }

    function merge(uint tokenId_, uint _otherTokenId) external
    {
        require(msg.sender == ownerOf(tokenId_), "owner");
        require(msg.sender == _getApproved(_otherTokenId), "approve");

        Stats storage stats1 = stats[tokenId_];
        Stats storage stats2 = stats[_otherTokenId];

        stats1.upvotes += stats2.upvotes;
        stats1.downvotes += stats2.downvotes;
        stats1.volumeUSD += stats2.volumeUSD;
        stats1.dealsCompleted += stats2.dealsCompleted;
        stats1.dealsExpired += stats2.dealsExpired;
        stats1.disputesLost += stats2.disputesLost;
        stats1.avgPaymentTime = (stats1.avgPaymentTime + stats2.avgPaymentTime) / 2;
        stats1.avgReleaseTime = (stats1.avgReleaseTime + stats2.avgReleaseTime) / 2;

        _burn(_otherTokenId);
        delete stats[_otherTokenId];
        delete ownerToTokenId[ownerOf(_otherTokenId)];
    }

    function statsVote(uint tokenId_, bool up_) onlyRole(DEAL_ROLE) external
    {
        up_ ? stats[tokenId_].upvotes++ : stats[tokenId_].downvotes++;
    }
    function statsVolumeUSD(uint tokenId_, uint64 _volumeUSD) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].volumeUSD += _volumeUSD;
    }
    function statsDealCompleted(uint tokenId_) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].dealsCompleted++;
    }
    function statsDealExpired(uint tokenId_) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].dealsExpired++;
    }
    function statsDisputeLost(uint tokenId_) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].disputesLost++;
    }
    function statsAvgPaymentTime(uint tokenId_, uint32 _dealTime) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].avgPaymentTime = (stats[tokenId_].avgPaymentTime + _dealTime) / 2;
    }
    function statsAvgReleaseTime(uint tokenId_, uint32 _dealTime) onlyRole(DEAL_ROLE) external
    {
        stats[tokenId_].avgReleaseTime = (stats[tokenId_].avgReleaseTime + _dealTime) / 2;
    }

    function _resetStats(uint tokenId_) private
    {
        stats[tokenId_] = Stats({
            createdAt: stats[tokenId_].createdAt,
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
