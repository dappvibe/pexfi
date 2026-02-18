// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {VestingWalletCliff} from "@openzeppelin/contracts/finance/VestingWalletCliff.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OptimisticOracleV3Interface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

/// @title PexfiVesting
/// @notice Holds sPEXFI and linearly releases them to the beneficiary.
contract PexfiVesting is VestingWalletCliff {
    IERC20 public immutable token;

    constructor(
        address beneficiary,
        uint64 startTimestamp,
        uint64 durationSeconds,
        uint64 cliffSeconds,
        IERC20 token_
    )
        VestingWallet(beneficiary, startTimestamp, durationSeconds)
        VestingWalletCliff(cliffSeconds)
    {
        token = token_;
    }

    /// @notice Helper for the beneficiary to use vested tokens for OOv3 assertions without claiming them first.
    function bond(address oracle, bytes calldata claim) external onlyOwner
    {
        OptimisticOracleV3Interface oov3 = OptimisticOracleV3Interface(oracle);

        uint bondAmount = oov3.getMinimumBond(address(token));
        token.approve(oracle, bondAmount);
        oov3.assertTruthWithDefaults(claim, address(this));
    }
}
