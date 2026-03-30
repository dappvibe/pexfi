// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PexfiBuybackAction
 * @notice Standalone contract to buy PEXFI from Uniswap v4 pool in a single transaction.
 */
contract PexfiBuybackAction {
    function run(address router, address pexfi) external payable {
        require(msg.value > 0, "No ETH sent");

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(pexfi),
            fee: 10000,
            tickSpacing: 200,
            hooks: IHooks(address(0))
        });

        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE),
            uint8(Actions.TAKE_ALL)
        );

        bytes[] memory v4Inputs = new bytes[](3);

        // 1. Swap ETH for PEXFI
        v4Inputs[0] = abi.encode(
            poolKey,
            true, // zeroForOne (ETH is currency0)
            uint128(msg.value),
            uint128(0), // amountOutMinimum
            "" // hookData
        );

        // 2. Settle ETH (pay from the ETH sent to this contract)
        v4Inputs[1] = abi.encode(
            Currency.wrap(address(0)),
            msg.value,
            false // payerIsUser = false (take from this contract)
        );

        // 3. Take PEXFI (send to this contract)
        v4Inputs[2] = abi.encode(
            Currency.wrap(pexfi),
            0 // minAmount
        );

        bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.V4_SWAP)));
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(v4Actions, v4Inputs);

        // Execute the swap on Universal Router
        IUniversalRouter(router).execute{value: msg.value}(commands, inputs, block.timestamp + 600);

        // Send bought PEXFI tokens back to the caller
        uint256 pexfiBal = IERC20(pexfi).balanceOf(address(this));
        if (pexfiBal > 0) {
            bool success = IERC20(pexfi).transfer(msg.sender, pexfiBal);
            require(success, "Transfer failed");
        }

        // Send back any remaining ETH
        if (address(this).balance > 0) {
            (bool success, ) = msg.sender.call{value: address(this).balance}("");
            require(success, "ETH refund failed");
        }
    }

    receive() external payable {}
}
