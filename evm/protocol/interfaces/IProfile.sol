// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

interface IProfile {
  struct Stats {
    uint32 createdAt;
    uint32 upvotes;
    uint32 downvotes;
    uint32 volumeUSD;
    uint32 avgPaymentTime;
    uint32 avgReleaseTime;
    uint32 dealsCompleted;
    uint32 dealsExpired;
    uint32 disputesLost;
  }

  function register() external returns (uint256 tokenId);

  function statsVote(uint256 tokenId_, bool up_) external;

  function statsVolumeUSD(uint256 tokenId_, uint32 _volumeUSD) external;

  function statsDealCompleted(uint256 tokenId_) external;

  function statsDealExpired(uint256 tokenId_) external;

  function statsDisputeLost(uint256 tokenId_) external;

  function statsAvgPaymentTime(uint256 tokenId_, uint32 _dealTime) external;

  function statsAvgReleaseTime(uint256 tokenId_, uint32 _dealTime) external;

  function stats(uint256 tokenId) external view returns (Stats memory);

  function ownerToTokenId(address owner) external view returns (uint256);

  function grantRole(bytes32 role, address account) external;
}
