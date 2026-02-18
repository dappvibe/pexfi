// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {OptimisticOracleV3Interface} from
    "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3CallbackRecipientInterface.sol";
import {Market} from "./Market.sol";
import {Offer} from "./Offer.sol";
import {Profile} from "./Profile.sol";
import "./libraries/Errors.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Deal is AccessControl, Initializable, OptimisticOracleV3CallbackRecipientInterface
{
    using Strings for string;

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

    // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
    uint16 private constant ACCEPTANCE_TIME = 15 minutes;
    uint16 private constant PAYMENT_WINDOW  = 1 hours;

    bytes32 private constant SELLER      = 'SELLER';
    bytes32 private constant BUYER       = 'BUYER';
    bytes32 private constant MEMBER      = 'MEMBER';

    string  public terms;
    uint    public tokenAmount;
    address public taker;
    uint    public fiatAmount;
    string  public paymentInstructions;
    uint    public allowCancelUnacceptedAfter;
    uint    public allowCancelUnpaidAfter;
    State   public state; // defaults to Initiated (0)
    Market  internal market;
    Offer   public offer;
    bool    public isPaid;

    struct Feedback {
        bool given;
        bool upvote;
        string message;
    }
    Feedback public feedbackForOwner;
    Feedback public feedbackForTaker;

    modifier stateBetween(State from_, State to_) {
        if (state < from_ || state > to_) revert ActionNotAllowedInThisState(state);
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
      _disableInitializers();
    }

    function initialize(
        address market_,
        address offer_,
        address taker_,
        uint tokenAmount_,
        uint fiatAmount_,
        string memory paymentInstructions_
    )
    external
    initializer
    {
        market = Market(market_);
        offer = Offer(offer_);

        taker = taker_;
        if (offer.isSell()) {
            _grantRole(BUYER, taker_);
            _grantRole(SELLER, offer.owner());
        } else {
            _grantRole(SELLER, taker_);
            _grantRole(BUYER, offer.owner());
        }
        _grantRole(MEMBER, offer.owner());
        _grantRole(MEMBER, taker_);

        tokenAmount = tokenAmount_;
        fiatAmount = fiatAmount_;
        paymentInstructions = paymentInstructions_;
        allowCancelUnacceptedAfter = block.timestamp + ACCEPTANCE_TIME;
        allowCancelUnpaidAfter = block.timestamp + 2 weeks; // initial safety value, overriden by accept()

        // copy MUTABLE offer values to freeze them for this deal
        terms = offer.terms();

        // notify from the new address for unified state transitions
        emit DealState(state, taker_);
    }

    /// @notice Offer owner agrees to the deal
    function accept() external stateBetween(State.Initiated, State.Initiated) {
        require(msg.sender == offer.owner(), UnauthorizedAccount(msg.sender));

        _state(State.Accepted);
        allowCancelUnpaidAfter = block.timestamp + PAYMENT_WINDOW;
    }

    /// @notice Seller funds the deal with tokens
    function fund() external onlyRole(SELLER) stateBetween(State.Accepted, State.Accepted) {
        market.fundDeal();
        _state(State.Funded);
    }

    function paid() external onlyRole(BUYER) stateBetween(State.Accepted, State.Funded) {
        _state(State.Paid);
    }

    function release() external stateBetween(State.Funded, State.Resolved) {
        if (state == State.Resolved) {
            require(isPaid, "not paid");
        } else {
            require(hasRole(SELLER, msg.sender), "not seller");
        }
        _release();
    }

    function _release() internal {
        IERC20Metadata token = market.token(offer.token()).api;
        if (hasRole(BUYER, taker)) {
            token.transfer(taker, tokenAmount - (tokenAmount * market.fee() / 10000));
        }
        else if (hasRole(BUYER, offer.owner())) {
            token.transfer(offer.owner(), tokenAmount - (tokenAmount * market.fee() / 10000));
        }
        else revert('no buyer');
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

        require(hasRole(MEMBER, msg.sender), UnauthorizedAccount(msg.sender));

        if (state == State.Initiated && taker == msg.sender && block.timestamp < allowCancelUnacceptedAfter) revert("too early");

        if (!(
            (state < State.Accepted)
            || (hasRole(BUYER, msg.sender) && state < State.Canceled)
            || (hasRole(SELLER, msg.sender) && ((state < State.Paid && block.timestamp > allowCancelUnpaidAfter)))
        )) revert ActionNotAllowedInThisState(state);

        // canceled after acceptance window
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
            if (hasRole(SELLER, taker)) {
                token.transfer(taker, tokenAmount);
            }
            else if (hasRole(SELLER, offer.owner())) {
                token.transfer(offer.owner(), tokenAmount);
            }
        }

        _state(State.Canceled);
    }

    function dispute() external onlyRole(MEMBER) stateBetween(State.Accepted, State.Paid) {
        _state(State.Disputed);
    }

    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external override {
        require(msg.sender == market.oracle(), "not oracle");
        require(state == State.Disputed, "not disputed");

        OptimisticOracleV3Interface _oov3 = OptimisticOracleV3Interface(msg.sender);
        OptimisticOracleV3Interface.Assertion memory assertion = _oov3.getAssertion(assertionId);

        if (assertion.domainId == keccak256(bytes("PAID"))) {
             isPaid = assertedTruthfully;
        } else if (assertion.domainId == keccak256(bytes("NOT PAID"))) {
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

    function message(string calldata message_) external onlyRole(MEMBER) {
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
            feedbackForTaker.message = message_;
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
            feedbackForOwner.message = message_;
            uint $tokenId = _profile.ownerToTokenId(offer.owner());
            if ($tokenId != 0) {
                _profile.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(offer.owner(), upvote, message_);
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return interfaceId == type(OptimisticOracleV3CallbackRecipientInterface).interfaceId || super.supportsInterface(interfaceId);
    }

    function _state(State state_) private {
        state = state_;
        emit DealState(state, msg.sender);
    }
}
