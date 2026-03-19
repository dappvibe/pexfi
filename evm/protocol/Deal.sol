// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IDeal} from "./interfaces/IDeal.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IOffer} from "./interfaces/IOffer.sol";
import {Services} from "./libraries/Services.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";
import {OptimisticOracleV3Interface} from "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract Deal is IDeal, ERC165, Initializable
{
  using SafeERC20 for IERC20;

  uint16 private constant ACCEPTANCE_TIME = 15 minutes;
  uint16 private constant PAYMENT_WINDOW = 1 hours;

  bytes32 private constant RESOLVE_PAID = keccak256("PAID");
  bytes32 private constant RESOLVE_NOT_PAID = keccak256("NOT PAID");

  uint256 public tokenAmount;
  address public taker;
  IDeal.State public state; // defaults to Initiated (0)
  bool    public isPaid;
  uint64  public allowCancelUnacceptedAfter;
  IOffer  public offer;
  uint64  public allowCancelUnpaidAfter;
  FinderInterface internal finder;

  function _seller() internal view returns (address) {
    return offer.isSell() ? offer.owner() : taker;
  }

  function _buyer() internal view returns (address) {
    return offer.isSell() ? taker : offer.owner();
  }

  modifier onlySeller() {
    require(msg.sender == _seller(), IMarket.UnauthorizedAccount(msg.sender));
    _;
  }

  modifier onlyBuyer() {
    require(msg.sender == _buyer(), IMarket.UnauthorizedAccount(msg.sender));
    _;
  }

  modifier onlyMember() {
    require(msg.sender == offer.owner() || msg.sender == taker, IMarket.UnauthorizedAccount(msg.sender));
    _;
  }

  modifier stateBetween(IDeal.State from_, IDeal.State to_) {
    if (state < from_ || state > to_) revert IDeal.ActionNotAllowedInThisState(state);
    _;
  }

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(IDeal.DealParams calldata params)
  external
  initializer
  {
    finder = FinderInterface(params.finder);
    offer = IOffer(params.offer);
    taker = params.taker;

    tokenAmount = params.tokenAmount;
    allowCancelUnacceptedAfter = uint64(block.timestamp + ACCEPTANCE_TIME);

    emit DealState(state, params.taker);
  }

  function accept() external stateBetween(IDeal.State.Initiated, IDeal.State.Initiated) {
    require(msg.sender == offer.owner(), IMarket.UnauthorizedAccount(msg.sender));

    _state(IDeal.State.Accepted);
    allowCancelUnpaidAfter = uint64(block.timestamp + PAYMENT_WINDOW);
  }

  function fund() external onlySeller stateBetween(IDeal.State.Accepted, IDeal.State.Accepted) {
    IMarket(finder.getImplementationAddress(Services.Market)).fundDeal();
    _state(IDeal.State.Funded);
  }

  function paid() external onlyBuyer stateBetween(IDeal.State.Accepted, IDeal.State.Funded) {
    _state(IDeal.State.Paid);
  }

  function release() external stateBetween(IDeal.State.Funded, IDeal.State.Resolved) {
    if (state == State.Resolved) {
      require(isPaid, InvalidResolution(isPaid));
    } else {
      require(msg.sender == _seller(), IMarket.UnauthorizedAccount(msg.sender));
    }
    _release();
  }

  function _release() internal {
    IMarket market = IMarket(finder.getImplementationAddress(Services.Market));
    IERC20 token = offer.token();
    uint feeAmount = tokenAmount * market.fee() / 10000;
    token.safeTransfer(_buyer(), tokenAmount - feeAmount);
    address feeCollector = finder.getImplementationAddress(Services.FeeCollector);
    token.safeTransfer(feeCollector, token.balanceOf(address(this)));

    _state(IDeal.State.Completed);
  }

  function cancel() external stateBetween(IDeal.State.Initiated, IDeal.State.Resolved) {
    if (state == IDeal.State.Resolved) {
      require(!isPaid, InvalidResolution(!isPaid));
      _cancel();
      return;
    }

    require(msg.sender == offer.owner() || msg.sender == taker, IMarket.UnauthorizedAccount(msg.sender));

    if (state == IDeal.State.Initiated) {
      if (msg.sender != offer.owner()) {
        if (block.timestamp <= allowCancelUnacceptedAfter) revert IDeal.ActionNotAllowedInThisState(state);
      }
    } else if (state == IDeal.State.Accepted || state == IDeal.State.Funded) {
      if (block.timestamp <= allowCancelUnpaidAfter) revert IDeal.ActionNotAllowedInThisState(state);
    } else {
      revert IDeal.ActionNotAllowedInThisState(state);
    }

    _cancel();
  }

  function _cancel() internal {
    if (state >= IDeal.State.Funded) {
      offer.token().safeTransfer(_seller(), tokenAmount);
    }

    _state(IDeal.State.Canceled);
  }

  function dispute() external onlyMember stateBetween(IDeal.State.Accepted, IDeal.State.Paid) {
    _state(IDeal.State.Disputed);
  }

  function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external override {
    require(msg.sender == finder.getImplementationAddress(Services.Oracle), IMarket.UnauthorizedAccount(msg.sender));
    if (state != IDeal.State.Disputed) return;

    OptimisticOracleV3Interface _oov3 = OptimisticOracleV3Interface(msg.sender);
    OptimisticOracleV3Interface.Assertion memory assertion = _oov3.getAssertion(assertionId);

    bytes32 resolution;
    if (assertion.domainId == RESOLVE_PAID) {
      isPaid = assertedTruthfully;
      resolution = isPaid ? RESOLVE_PAID : RESOLVE_NOT_PAID;
    } else if (assertion.domainId == RESOLVE_NOT_PAID) {
      isPaid = !assertedTruthfully;
      resolution = isPaid ? RESOLVE_PAID : RESOLVE_NOT_PAID;
    }

    emit DisputeResolved(resolution);
    _state(IDeal.State.Resolved);
  }

  function assertionDisputedCallback(bytes32 assertionId) external override {}

  function message(string calldata message_) external onlyMember {
    emit Message(msg.sender, message_);
  }

  function feedback(bool upvote, string calldata message_)
  external
  onlyMember
  stateBetween(IDeal.State.Resolved, IDeal.State.Completed)
  {
    if (msg.sender == offer.owner()) {
      emit FeedbackGiven(taker, upvote, message_);
    }
    else if (msg.sender == taker) {
      emit FeedbackGiven(offer.owner(), upvote, message_);
    }
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
    return interfaceId == type(OptimisticOracleV3CallbackRecipientInterface).interfaceId || super.supportsInterface(interfaceId);
  }

  function _state(IDeal.State state_) private {
    state = state_;
    emit DealState(state, msg.sender);
  }
}
