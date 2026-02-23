// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {OptimisticOracleV3Interface} from
    "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";
import {Market} from "./Market.sol";
import {Offer} from "./Offer.sol";
import {Profile} from "./Profile.sol";
import "./libraries/Errors.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract Deal is ERC165, Initializable, OptimisticOracleV3CallbackRecipientInterface
{
    event DealState(State state, address sender);
    event Message(address indexed sender, string message);
    event FeedbackGiven(address indexed to, bool upvote, string message);

    error ActionNotAllowedInThisState(State state);

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

    uint16 private constant ACCEPTANCE_TIME = 15 minutes;
    uint16 private constant PAYMENT_WINDOW  = 1 hours;

    bytes32 private constant RESOLVE_PAID = keccak256("PAID");
    bytes32 private constant RESOLVE_NOT_PAID  = keccak256("NOT PAID");

    struct DealParams {
        address market;
        address offer;
        address taker;
        uint tokenAmount;
        uint fiatAmount;
    }

    uint    public tokenAmount;
    address public taker;
    uint    public fiatAmount;
    uint    public allowCancelUnacceptedAfter;
    uint    public allowCancelUnpaidAfter;
    State   public state; // defaults to Initiated (0)
    Market  internal market;
    Offer   public offer;
    bool    public isPaid;

    struct Feedback {
        bool given;
        bool upvote;
    }
    Feedback public feedbackForOwner;
    Feedback public feedbackForTaker;

    function _seller() internal view returns (address) {
        return offer.isSell() ? offer.owner() : taker;
    }

    function _buyer() internal view returns (address) {
        return offer.isSell() ? taker : offer.owner();
    }

    modifier onlySeller() {
        require(msg.sender == _seller(), UnauthorizedAccount(msg.sender));
        _;
    }

    modifier onlyBuyer() {
        require(msg.sender == _buyer(), UnauthorizedAccount(msg.sender));
        _;
    }

    modifier onlyMember() {
        require(msg.sender == offer.owner() || msg.sender == taker, UnauthorizedAccount(msg.sender));
        _;
    }

    modifier stateBetween(State from_, State to_) {
        if (state < from_ || state > to_) revert ActionNotAllowedInThisState(state);
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
      _disableInitializers();
    }

    function initialize(DealParams calldata params)
    external
    initializer
    {
        market = Market(params.market);
        offer = Offer(params.offer);
        taker = params.taker;

        tokenAmount = params.tokenAmount;
        fiatAmount = params.fiatAmount;
        allowCancelUnacceptedAfter = block.timestamp + ACCEPTANCE_TIME;
        allowCancelUnpaidAfter = block.timestamp + 2 weeks;

        emit DealState(state, params.taker);
    }

    function accept() external stateBetween(State.Initiated, State.Initiated) {
        require(msg.sender == offer.owner(), UnauthorizedAccount(msg.sender));

        _state(State.Accepted);
        allowCancelUnpaidAfter = block.timestamp + PAYMENT_WINDOW;
    }

    function fund() external onlySeller stateBetween(State.Accepted, State.Accepted) {
        market.fundDeal();
        _state(State.Funded);
    }

    function paid() external onlyBuyer stateBetween(State.Accepted, State.Funded) {
        _state(State.Paid);
    }

    function release() external stateBetween(State.Funded, State.Resolved) {
        if (state == State.Resolved) {
            require(isPaid, "not paid");
        } else {
            require(msg.sender == _seller(), "not seller");
        }
        _release();
    }

    function _release() internal {
        IERC20Metadata token = market.token(offer.token()).api;
        uint feeAmount = tokenAmount * market.fee() / 10000;
        token.transfer(_buyer(), tokenAmount - feeAmount);
        token.transfer(market.feeCollector(), token.balanceOf(address(this)));

        _state(State.Completed);

        Profile _profile = Profile(market.profile());
        uint $tokenId = _profile.ownerToTokenId(offer.owner());
        if ($tokenId != 0) {
            _profile.statsDealCompleted($tokenId);
        }
        $tokenId = _profile.ownerToTokenId(taker);
        if ($tokenId != 0) {
            _profile.statsDealCompleted($tokenId);
        }
    }

    function cancel() external stateBetween(State.Initiated, State.Resolved) {
        if (state == State.Resolved) {
            require(!isPaid, "paid");
            _cancel();
            return;
        }

        require(msg.sender == offer.owner() || msg.sender == taker, UnauthorizedAccount(msg.sender));

        if (msg.sender == taker) {
            if (state >= State.Accepted) {
                if (block.timestamp <= allowCancelUnpaidAfter) revert("too early");
                if (state != State.Accepted) revert ActionNotAllowedInThisState(state);
            }
        } else {
            if (!(
                (state < State.Accepted)
                || (msg.sender == _buyer() && state < State.Canceled)
                || (msg.sender == _seller() && (state < State.Paid && block.timestamp > allowCancelUnpaidAfter))
            )) revert ActionNotAllowedInThisState(state);
        }

        if (state == State.Initiated && msg.sender != offer.owner()) {
            Profile _profile = Profile(market.profile());
            uint $tokenId = _profile.ownerToTokenId(msg.sender);
            if ($tokenId != 0) {
                _profile.statsDealExpired($tokenId);
            }
        }
        _cancel();
    }

    function _cancel() internal {
        IERC20Metadata token = market.token(offer.token()).api;
        if (state >= State.Funded) {
            token.transfer(_seller(), tokenAmount);
        }

        _state(State.Canceled);
    }

    function dispute() external onlyMember stateBetween(State.Accepted, State.Paid) {
        _state(State.Disputed);
    }

    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external override {
        require(msg.sender == market.oracle(), "not oracle");
        require(state == State.Disputed, "not disputed");

        OptimisticOracleV3Interface _oov3 = OptimisticOracleV3Interface(msg.sender);
        OptimisticOracleV3Interface.Assertion memory assertion = _oov3.getAssertion(assertionId);

        if (assertion.domainId == RESOLVE_PAID) {
             isPaid = assertedTruthfully;
        } else if (assertion.domainId == RESOLVE_NOT_PAID) {
             isPaid = !assertedTruthfully;
        }

        _state(State.Resolved);
    }

    function assertionDisputedCallback(bytes32 assertionId) external override {}

    function _oracle() internal view returns (OptimisticOracleV3Interface) {
        address oov3 = market.oracle();
        require(oov3 != address(0), "no oracle");
        return OptimisticOracleV3Interface(oov3);
    }

    function message(string calldata message_) external onlyMember {
        emit Message(msg.sender, message_);
    }

    function feedback(bool upvote, string calldata message_)
    external
    stateBetween(State.Resolved, State.Completed)
    {
        Profile _profile = Profile(market.profile());
        if (msg.sender == offer.owner()) {
            require(!feedbackForTaker.given, "already");
            feedbackForTaker.given = true;
            feedbackForTaker.upvote = upvote;
            uint $tokenId = _profile.ownerToTokenId(taker);
            if ($tokenId != 0) {
                _profile.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(taker, upvote, message_);
        }
        else if (msg.sender == taker) {
            require(!feedbackForOwner.given, "already");
            feedbackForOwner.given = true;
            feedbackForOwner.upvote = upvote;
            uint $tokenId = _profile.ownerToTokenId(offer.owner());
            if ($tokenId != 0) {
                _profile.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(offer.owner(), upvote, message_);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
        return interfaceId == type(OptimisticOracleV3CallbackRecipientInterface).interfaceId || super.supportsInterface(interfaceId);
    }

    function _state(State state_) private {
        state = state_;
        emit DealState(state, msg.sender);
    }
}
