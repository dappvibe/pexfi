// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {Commands} from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PexfiVault} from "./PexfiVault.sol";

interface IWETH {
    function withdraw(uint256 amount) external;
}

contract FeeCollector {
    using SafeERC20 for IERC20;
    using CurrencyLibrary for Currency;

    address public immutable vault;
    Currency public immutable pexfi;
    IUniversalRouter public immutable universalRouter;
    address public immutable weth; // Re-introduced WETH

    PoolKey public pexfiPoolKey; // ETH/PEXFI pool key

    // Events
    event Buyback(address indexed token, uint256 amountIn, uint256 amountPexfiOut);
    event PexfiPoolKeySet(PoolKey key);

    // Local definition to avoid type mismatch with IV4Router import
    struct ExactInputSingleParams {
        PoolKey poolKey;
        bool zeroForOne;
        uint128 amountIn;
        uint128 amountOutMinimum;
        bytes hookData;
    }

    constructor(
        address _vault,
        address _pexfi,
        address _universalRouter,
        address _weth
    ) {
        require(_vault != address(0) && _pexfi != address(0) && _universalRouter != address(0) && _weth != address(0), "Invalid address");
        vault = _vault;
        pexfi = Currency.wrap(_pexfi);
        universalRouter = IUniversalRouter(_universalRouter);
        weth = _weth;
    }

    /**
     * @notice Set the PEXFI/ETH V4 pool key
     * @param _key The Uniswap V4 pool key for the PEXFI/ETH pair
     */
    function setPexfiPoolKey(PoolKey memory _key) external {
        // Enforce PEXFI usage
        require(Currency.unwrap(_key.currency0) == Currency.unwrap(pexfi) || Currency.unwrap(_key.currency1) == Currency.unwrap(pexfi), "Must involve PEXFI");
        // Enforce Native ETH usage for the other side
        require(Currency.unwrap(_key.currency0) == address(0) || Currency.unwrap(_key.currency1) == address(0), "Must involve ETH");

        pexfiPoolKey = _key;
        emit PexfiPoolKeySet(_key);
    }

    /**
     * @notice Trigger buyback for a specific token
     * @param token The address of the token to buy back (address(0) for Native ETH)
     * @param fee The Uniswap V4 pool fee tier for Token/Native pair (e.g. 3000 for 0.3%)
     */
    function buyback(address token, uint24 fee) external payable {
        // 0. If PEXFI, send to Vault directly
        if (token == Currency.unwrap(pexfi)) {
            uint256 bal = IERC20(token).balanceOf(address(this));
            if (bal > 0) IERC20(token).safeTransfer(vault, bal);
            return;
        }

        // 1. Swap
        if (token == address(0)) {
            // Already Native ETH
            _swapEthToPexfi();
        } else if (token == weth) {
            // Unwrap WETH -> ETH, then Swap ETH -> PEXFI
            uint256 wethBal = IERC20(weth).balanceOf(address(this));
            if (wethBal > 0) {
                IWETH(weth).withdraw(wethBal);
                _swapEthToPexfi();
            }
        } else {
            // Standard Token -> Native -> PEXFI
            _swapTokenToPexfi(token, fee);
        }

        // 2. Final Sweep of PEXFI to Vault
        uint256 pexfiBal = IERC20(Currency.unwrap(pexfi)).balanceOf(address(this));
        if (pexfiBal > 0) {
            IERC20(Currency.unwrap(pexfi)).safeTransfer(vault, pexfiBal);
        }
    }

    /**
     * @param token The token address to swap from
     * @param fee The Uniswap V4 pool fee tier for the Token/Native pair
     */
    function _swapTokenToPexfi(address token, uint24 fee) internal {
        uint256 amountIn = IERC20(token).balanceOf(address(this));
        if (amountIn == 0) return;

        // Approve Universal Router
        IERC20(token).forceApprove(address(universalRouter), amountIn);

        // Construct PoolKey for Token/Native (V4)
        Currency currency0 = Currency.wrap(token);
        Currency currency1 = CurrencyLibrary.ADDRESS_ZERO;
        if (currency0 > currency1) (currency0, currency1) = (currency1, currency0); // Sort

        int24 tickSpacing = 60;
        if (fee == 100) tickSpacing = 2;   // 0.01% -> 2
        else if (fee == 500) tickSpacing = 10; // 0.05% -> 10
        else if (fee == 3000) tickSpacing = 60; // 0.3% -> 60
        else if (fee == 10000) tickSpacing = 200; // 1% -> 200

        PoolKey memory tokenPoolKey = PoolKey({
            currency0: currency0,
            currency1: currency1,
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0))
        });

        bytes[] memory v4Inputs = new bytes[](3);

        // Action 1: Swap Token -> Native
        bool zeroForOne = false;
        ExactInputSingleParams memory swapParams1 = ExactInputSingleParams({
            poolKey: tokenPoolKey,
            zeroForOne: zeroForOne,
            amountIn: uint128(amountIn),
            amountOutMinimum: 0,
            hookData: ""
        });
        v4Inputs[0] = abi.encode(swapParams1);

        // Action 2: Settle Input Token
        v4Inputs[1] = abi.encode(
            Currency.wrap(token),
            amountIn,
            true // payerIsUser
        );

        // Action 3: Take Native: To FeeCollector
        v4Inputs[2] = abi.encode(
            CurrencyLibrary.ADDRESS_ZERO,
            0 // minAmount
        );

        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE),
            uint8(Actions.TAKE_ALL)
        );

        bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.V4_SWAP)));
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(v4Actions, v4Inputs);

        universalRouter.execute(commands, inputs, block.timestamp);

        // Now chained Native -> PEXFI
        if (address(this).balance > 0) {
            _swapEthToPexfi();
        }
    }

    function _swapEthToPexfi() internal {
        uint256 amountIn = address(this).balance;
        if (amountIn == 0) return;

        PoolKey memory key = pexfiPoolKey;
        bool zeroForOne = Currency.unwrap(key.currency0) == address(0);

        ExactInputSingleParams memory swapParams = ExactInputSingleParams({
            poolKey: key,
            zeroForOne: zeroForOne,
            amountIn: uint128(amountIn),
            amountOutMinimum: 0,
            hookData: ""
        });

        bytes[] memory v4Inputs = new bytes[](3);
        v4Inputs[0] = abi.encode(swapParams);

        // Settle Native: Pay from Msg.Value (UR handles logic if we send value)
        v4Inputs[1] = abi.encode(
            CurrencyLibrary.ADDRESS_ZERO,
            amountIn,
            false // Payer is UR (we sent value)
        );

        // Take PEXFI: To FeeCollector (then sweep to vault)
        v4Inputs[2] = abi.encode(
            pexfi,
            0 // minAmount
        );

        bytes memory v4Actions = abi.encodePacked(
            uint8(Actions.SWAP_EXACT_IN_SINGLE),
            uint8(Actions.SETTLE),
            uint8(Actions.TAKE_ALL)
        );

        bytes memory commands = abi.encodePacked(bytes1(uint8(Commands.V4_SWAP)));
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(v4Actions, v4Inputs);

        universalRouter.execute{value: amountIn}(commands, inputs, block.timestamp);
    }

    receive() external payable {}
}
