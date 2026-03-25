// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IOffer} from "./IOffer.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from
"@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";

interface IDeal is OptimisticOracleV3CallbackRecipientInterface {
  error ActionNotAllowedInThisState(State state);
  error InvalidResolution(bool resolvedPaid);

  event DealState(State state, address sender);
  event Message(address sender, string message);
  event FeedbackGiven(address to, bool upvote, string message);
  event DisputeResolved(bytes32 domainId);

  enum State {
    Initiated,
    Accepted,
    Funded,
    Paid,
    Disputed,
    Canceled,
    Resolved,
    Completed
  }

  struct DealParams {
    address offer;
    address taker;
    uint256 tokenAmount;
    uint256 fiatAmount;
  }

  function initialize(DealParams calldata params) external;

  function accept() external;

  function fund() external;

  function paid() external;

  function release() external;

  function cancel() external;

  function dispute() external;

  function message(string calldata message_) external;

  function feedback(bool upvote, string calldata message_) external;

  function tokenAmount() external view returns (uint256);

  function taker() external view returns (address);

  function state() external view returns (State);

  function offer() external view returns (IOffer);

  function resolvedPaid() external view returns (bool);
}
