// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {VestingWalletCliff} from "@openzeppelin/contracts/finance/VestingWalletCliff.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {OptimisticOracleV3Interface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";

import {FinderConstants} from "./libraries/FinderConstants.sol";

/// @dev Must replicate to avoid IERC20 version mismatch
interface IOptimisticOracleV3 {
    function defaultLiveness() external view returns (uint64);
    function defaultIdentifier() external view returns (bytes32);
    function getMinimumBond(address currency) external view returns (uint256);
    function assertTruth(
        bytes memory claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        IERC20 currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external returns (bytes32 assertionId);
}

/// @title PexfiVesting
/// @notice Holds sPEXFI and linearly releases them to the beneficiary.
contract PexfiVesting is VestingWalletCliff {
    FinderInterface public immutable finder;
    IERC20 public immutable token;

    constructor(
        address beneficiary,
        uint64 startTimestamp,
        uint64 durationSeconds,
        uint64 cliffSeconds,
        address finder_
    )
        VestingWallet(beneficiary, startTimestamp, durationSeconds)
        VestingWalletCliff(cliffSeconds)
    {
        finder = FinderInterface(finder_);
        token = IERC20(finder.getImplementationAddress(FinderConstants.PexfiVault));
    }

    /// @notice Helper for the beneficiary to use vested tokens for OOv3 assertions without claiming them first.
    function bond(address deal, bytes calldata claim) external onlyOwner
    {
        require(
            keccak256(claim) == keccak256(bytes("PAID")) ||
            keccak256(claim) == keccak256(bytes("NOT PAID")),
            "invalid claim"
        );
        require(
            IERC165(deal).supportsInterface(type(OptimisticOracleV3CallbackRecipientInterface).interfaceId),
            "deal: no callback interface"
        );


        address oracleAddress = finder.getImplementationAddress(FinderConstants.Oracle);
        IOptimisticOracleV3 oov3 = IOptimisticOracleV3(oracleAddress);

        uint bondAmount = oov3.getMinimumBond(address(token));

        token.approve(oracleAddress, bondAmount);

        oov3.assertTruth(
            claim,
            address(this),                                                            // asserter
            deal,                                                              // callbackRecipient
            address(0),                                                       // escalationManager
            oov3.defaultLiveness(),                                                   // liveness
            token,                                                                   // currency
            bondAmount,                                                                 // bond
            '0x4153534552545f54525554480000000000000000000000000000000000000000',     // ASSERT_TRUTH
            keccak256(claim)                // domainId
        );
    }
}
