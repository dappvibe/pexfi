// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

interface IProfile {
  error FeedbackAlreadyGiven();
  error ProfileAlreadyExists();
  error UnauthorizedAccount();

  event UpdatedInfo(uint256 indexed tokenId, string info);

  function register() external returns (uint256 tokenId);

  function ownerToTokenId(address owner) external view returns (uint256);
}
