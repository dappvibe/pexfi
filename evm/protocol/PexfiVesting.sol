// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {VestingWalletCliff} from "@openzeppelin/contracts/finance/VestingWalletCliff.sol";

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
    }
}
