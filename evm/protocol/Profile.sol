// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IProfile} from "./interfaces/IProfile.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// @dev separate profile NFT allows multiple markets attached and rep be shared across them
contract Profile is IProfile, UUPSUpgradeable, OwnableUpgradeable, ERC721Upgradeable
{
  uint private _nextTokenId;

  mapping(address owner => uint) public ownerToTokenId;

  function initialize() initializer external
  {
    __ERC721_init("PEXFI User Reputation", "PEXFIUSER");
    __Ownable_init(msg.sender);
    _nextTokenId = 1;
  }

  function _authorizeUpgrade(address) internal onlyOwner override {}

  function register() external returns (uint tokenId)
  {
    require(ownerToTokenId[msg.sender] == 0, IProfile.ProfileAlreadyExists());

    tokenId = _nextTokenId;
    _mint(msg.sender, tokenId);
    ownerToTokenId[msg.sender] = tokenId;
    _nextTokenId++;
  }

  function updateInfo(uint tokenId_, string calldata info_) external
  {
    if (ownerToTokenId[msg.sender] != tokenId_) revert IProfile.UnauthorizedAccount();
    emit UpdatedInfo(tokenId_, info_);
  }

  function supportsInterface(bytes4 interfaceId) public view
  override(ERC721Upgradeable)
  returns (bool) {
    return ERC721Upgradeable.supportsInterface(interfaceId);
  }
}
