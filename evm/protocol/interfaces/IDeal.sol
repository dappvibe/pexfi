// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IOffer} from "./IOffer.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from
"@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";

interface IDeal is OptimisticOracleV3CallbackRecipientInterface {
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
    address finder;
    address offer;
    address taker;
    uint256 tokenAmount;
    uint256 fiatAmount;
  }

  struct Feedback {
    bool given;
    bool upvote;
  }

  event DealState(State state, address sender);
  event Message(address indexed sender, string message);
  event FeedbackGiven(address indexed to, bool upvote, string message);

  error ActionNotAllowedInThisState(State state);

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

  function fiatAmount() external view returns (uint256);

  function allowCancelUnacceptedAfter() external view returns (uint256);

  function allowCancelUnpaidAfter() external view returns (uint256);

  function state() external view returns (State);

  function offer() external view returns (IOffer);

  function isPaid() external view returns (bool);

  function feedbackForOwner() external view returns (bool given, bool upvote);

  function feedbackForTaker() external view returns (bool given, bool upvote);
}
