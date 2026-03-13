// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {PositionInfo, PositionInfoLibrary} from "@uniswap/v4-periphery/src/libraries/PositionInfoLibrary.sol";

interface IPositionManager is IERC721 {
  function modifyLiquidities(bytes calldata unlockData, uint256 deadline) external payable;
  function getPositionLiquidity(uint256 tokenId) external view returns (uint128 liquidity);
  function positionInfo(uint256 tokenId) external view returns (PositionInfo);
  function poolKeys(bytes25 poolId) external view returns (PoolKey memory);
}

/// @title PexfiAntiRugpull
/// @notice Holds Uniswap v4 LP-NFTs forever while allowing the owner to collect fees.
contract PexfiAntiRugpull is Ownable, IERC721Receiver {
  using PositionInfoLibrary for PositionInfo;

  IPositionManager public immutable posm;

  error LiquidityDecreased();

  constructor(address _posm, address _owner) Ownable(_owner) {
    posm = IPositionManager(_posm);
  }

  /**
   * @notice Collects accrued fees from a Uniswap v4 position held by this contract.
   * @dev Fees are sent directly to the owner. It ensures that liquidity does not decrease.
   */
  function claimFees(uint256 tokenId) external onlyOwner {
    PositionInfo info = posm.positionInfo(tokenId);
    bytes25 poolId = info.poolId();
    PoolKey memory poolKey = posm.poolKeys(poolId);

    bytes[] memory params = new bytes[](3);
    params[0] = abi.encode(tokenId, uint256(0), uint128(0), uint128(0), "");
    params[1] = abi.encode(poolKey.currency0, owner(), uint256(0));
    params[2] = abi.encode(poolKey.currency1, owner(), uint256(0));

    bytes memory actions = abi.encodePacked(uint8(Actions.DECREASE_LIQUIDITY), uint8(Actions.TAKE), uint8(Actions.TAKE));
    bytes memory unlockData = abi.encode(actions, params);

    uint128 liquidityBefore = posm.getPositionLiquidity(tokenId);

    posm.modifyLiquidities(unlockData, block.timestamp);

    uint128 liquidityAfter = posm.getPositionLiquidity(tokenId);
    if (liquidityAfter < liquidityBefore) {
      revert LiquidityDecreased();
    }
  }

  /**
   * @notice Blackhole for any received NFT with no way to get it back.
   */
  function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }

  receive() external payable {}
}
