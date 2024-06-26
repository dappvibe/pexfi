// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IRepToken is IERC721, IERC721Metadata
{
    function ownerToTokenId(address owner) external returns(uint);
    function register() external returns(uint tokenId);
    function merge(uint tokenId_, uint _otherTokenId) external;
    function statsVote(uint tokenId_, bool up_) external;
    function statsVolumeUSD(uint tokenId_, uint64 _volumeUSD) external;
    function statsDealCompleted(uint _tokens) external;
    function statsDealExpired(uint tokenId_) external;
    function statsDisputeLost(uint tokenId_) external;
    function statsAvgPaymentTime(uint tokenId_, uint32 _dealTime) external;
    function statsAvgReleaseTime(uint tokenId_, uint32 _dealTime) external;
}
