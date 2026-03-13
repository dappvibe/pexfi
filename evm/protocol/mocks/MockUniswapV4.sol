// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";

// Using a simplified PositionInfo if the library cannot be easily imported without dependencies
// PositionInfo is basically a bytes32 wrapper in v4
type PositionInfo is bytes32;

contract MockPositionManager is ERC721 {
    IPoolManager public immutable poolManager;

    constructor(address _poolManager) ERC721("Mock Position Manager", "MOCK-POSM") {
        poolManager = IPoolManager(_poolManager);
    }

    function modifyLiquidities(bytes calldata, uint256) external payable {}
    function getPositionLiquidity(uint256) external view returns (uint128) { return 0; }
    function positionInfo(uint256) external view returns (PositionInfo) { return PositionInfo.wrap(bytes32(0)); }
    function poolKeys(bytes25) external pure returns (PoolKey memory) {
        return PoolKey(Currency.wrap(address(0)), Currency.wrap(address(0)), 0, 0, IHooks(address(0)));
    }
}
