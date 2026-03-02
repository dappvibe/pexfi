// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";

/**
 * @title UniswapUniversalRouterMock
 * @notice A simple mock for Uniswap Universal Router to facilitate testing of FeeCollector.
 */
contract UniswapUniversalRouterMock is IUniversalRouter {
    /**
     * @notice Executes encoded commands along with provided inputs.
     * @dev For this mock, we just accept the call. In a more advanced version,
     * it could parse commands and simulate swaps.
     */
    function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable override {
        // Simple mock: do nothing, but allow the call.
        // This is enough to verify that FeeCollector can call the router.
    }

    /**
     * @notice Executes encoded commands with EIP712 signature verification
     */
    function executeSigned(
        bytes calldata commands,
        bytes[] calldata inputs,
        bytes32 intent,
        bytes32 data,
        bool verifySender,
        bytes32 nonce,
        bytes calldata signature,
        uint256 deadline
    ) external payable override {
        // Not implemented in mock
    }

    /**
     * @notice Returns all signed execution context
     */
    function signedRouteContext() external view override returns (address signer, bytes32 intent, bytes32 data) {
        return (address(0), bytes32(0), bytes32(0));
    }

    /**
     * @notice Allow receiving ETH
     */
    receive() external payable {}
}
