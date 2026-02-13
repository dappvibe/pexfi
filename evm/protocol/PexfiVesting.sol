// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {VestingWalletCliff} from "@openzeppelin/contracts/finance/VestingWalletCliff.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title PexfiVesting — Team token vesting with cliff and vote delegation
/// @notice Holds sPEXFI and linearly releases them to the beneficiary.
///         Voting power is delegated to the beneficiary so vested tokens still bear votes.
contract PexfiVesting is VestingWalletCliff {
    IVotes public immutable votingToken;

    constructor(
        address beneficiary,
        uint64 startTimestamp,
        uint64 durationSeconds,
        uint64 cliffSeconds,
        IVotes votingToken_
    )
        VestingWallet(beneficiary, startTimestamp, durationSeconds)
        VestingWalletCliff(cliffSeconds)
    {
        votingToken = votingToken_;
        votingToken_.delegate(beneficiary);
    }
}
