// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IProfile} from "./interfaces/IProfile.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

// @dev separate profile NFT allows multiple markets attached and rep be shared across them
contract Profile is IProfile, UUPSUpgradeable, AccessControlUpgradeable, ERC721Upgradeable
{
  mapping(uint => IProfile.Stats) private _stats;
  uint private _nextTokenId;

  mapping(address owner => uint) public ownerToTokenId;

  bytes32 internal constant MARKET_ROLE = "MARKET_ROLE";
  bytes32 internal constant DEAL_ROLE = "DEAL_ROLE";

  function initialize() initializer external
  {
    __ERC721_init("PEXFI User Reputation", "PEXFIUSER");
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setRoleAdmin(DEAL_ROLE, MARKET_ROLE);
    _nextTokenId = 1;
  }

  function _authorizeUpgrade(address) internal onlyRole(DEFAULT_ADMIN_ROLE) override {}

  function grantRole(bytes32 role, address account) public override(AccessControlUpgradeable, IProfile) {
    super.grantRole(role, account);
  }

  function supportsInterface(bytes4 interfaceId) public view
  override(ERC721Upgradeable, AccessControlUpgradeable)
  returns (bool) {
    return
        ERC721Upgradeable.supportsInterface(interfaceId) ||
        AccessControlUpgradeable.supportsInterface(interfaceId);
  }

  function stats(uint256 tokenId_) external view override returns (IProfile.Stats memory) {
    return _stats[tokenId_];
  }

  function register() external returns (uint tokenId)
  {
    require(ownerToTokenId[msg.sender] == 0, IProfile.ProfileAlreadyExists());

    tokenId = _nextTokenId;
    _mint(msg.sender, tokenId);
    _resetStats(tokenId);
    _stats[tokenId].createdAt = uint32(block.timestamp);
    ownerToTokenId[msg.sender] = tokenId;
    _nextTokenId++;
  }

  function statsVote(uint tokenId_, bool up_) onlyRole(DEAL_ROLE) external
  {
    unchecked {up_ ? _stats[tokenId_].upvotes++ : _stats[tokenId_].downvotes++;}
  }

  function statsVolumeUSD(uint tokenId_, uint32 _volumeUSD) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].volumeUSD += _volumeUSD;}
  }

  function statsDealCompleted(uint tokenId_) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].dealsCompleted++;}
  }

  function statsDealExpired(uint tokenId_) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].dealsExpired++;}
  }

  function statsDisputeLost(uint tokenId_) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].disputesLost++;}
  }

  function statsAvgPaymentTime(uint tokenId_, uint32 _dealTime) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].avgPaymentTime = (_stats[tokenId_].avgPaymentTime + _dealTime) / 2;}
  }

  function statsAvgReleaseTime(uint tokenId_, uint32 _dealTime) onlyRole(DEAL_ROLE) external
  {
    unchecked {_stats[tokenId_].avgReleaseTime = (_stats[tokenId_].avgReleaseTime + _dealTime) / 2;}
  }

  function _resetStats(uint tokenId_) private
  {
    _stats[tokenId_] = IProfile.Stats({
      createdAt: _stats[tokenId_].createdAt,
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
