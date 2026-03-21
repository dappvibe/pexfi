// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
import {VestingWalletCliff} from "@openzeppelin/contracts/finance/VestingWalletCliff.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {OptimisticOracleV3Interface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";

import {Services} from "./libraries/Services.sol";
import {IMarket} from "./interfaces/IMarket.sol";

/// @dev Must replicate to avoid IERC20 version mismatch
interface IOptimisticOracleV3 {
  error InvlalidClaim();

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
  IMarket public immutable market;
  IERC20 public immutable token;

  constructor(
    address beneficiary,
    uint64 startTimestamp,
    uint64 durationSeconds,
    uint64 cliffSeconds,
    address market_
  )
  VestingWallet(beneficiary, startTimestamp, durationSeconds)
  VestingWalletCliff(cliffSeconds)
  {
    market = IMarket(market_);
    token = IERC20(market.getImplementationAddress(Services.PexfiVault));
  }

  bytes32 private constant PAID = keccak256("PAID");
  bytes32 private constant NOT_PAID = keccak256("NOT PAID");

  /// @notice Helper for the beneficiary to use vested tokens for OOv3 assertions without claiming them first.
  function bond(address deal, bytes calldata claim) external onlyOwner
  {
    bytes32 claimHash = keccak256(claim);
    require(claimHash == PAID || claimHash == NOT_PAID, IOptimisticOracleV3.InvlalidClaim());
    require(
      IERC165(deal).supportsInterface(type(OptimisticOracleV3CallbackRecipientInterface).interfaceId),
      IMarket.InvalidArgument()
    );

    address oracleAddress = market.getImplementationAddress(Services.Oracle);
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
      0x4153534552545f54525554480000000000000000000000000000000000000000,      // ASSERT_TRUTH
      claimHash                                                                // domainId
    );
  }
}
