// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Market} from "./Market.sol";
import {Offer} from "./Offer.sol";
import {RepToken} from "./RepToken.sol";
import "./libraries/Errors.sol";

uint8 constant FEE = 100; // 1%

contract Deal is AccessControl
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
    uint16 private ACCEPTANCE_TIME = 15 minutes;
    uint16 private PAYMENT_WINDOW  = 1 hours;

    bytes32 private constant MEDIATOR    = 'MEDIATOR';
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
    State   public state = State.Initiated;
    Market  private market;
    Offer   public offer;

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

    constructor(
        address market_,
        address offer_,
        address taker_,
        uint tokenAmount_,
        uint fiatAmount_,
        string memory paymentInstructions_
    )
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

    function release() external onlyRole(SELLER) stateBetween(State.Funded, State.Canceled) {
        // TODO allow mediator to release() while filtering out BUYER. note onlyRole(SELLER)
        IERC20Metadata token = market.token(offer.token()).api;
        if (hasRole(BUYER, taker)) {
            token.transfer(taker, tokenAmount - (tokenAmount * FEE / 10000));
        }
        else if (hasRole(BUYER, offer.owner())) {
            token.transfer(offer.owner(), tokenAmount - (tokenAmount * FEE / 10000));
        }
        else revert('no buyer');
        token.transfer(market.mediator(), token.balanceOf(address(this)));

        _state(State.Completed);

        RepToken repToken = RepToken(market.repToken());
        uint $tokenId = repToken.ownerToTokenId(offer.owner());
        if ($tokenId != 0) {
            repToken.statsDealCompleted($tokenId);
        }
        $tokenId = repToken.ownerToTokenId(taker);
        if ($tokenId != 0) {
            repToken.statsDealCompleted($tokenId);
        }
    }

    function cancel() external onlyRole(MEMBER) stateBetween(State.Initiated, State.Resolved) {
        if (state == State.Initiated && taker == msg.sender && block.timestamp < allowCancelUnacceptedAfter) revert("too early");

        if ((state < State.Accepted)
        ||  (hasRole(BUYER, msg.sender) && state < State.Canceled)
        || (hasRole(SELLER, msg.sender) && ((state < State.Paid && block.timestamp > allowCancelUnpaidAfter)))
        || hasRole(MEDIATOR, msg.sender)
        )
        {
            IERC20Metadata token = market.token(offer.token()).api;
            if (state == State.Funded) {
                if (hasRole(SELLER, taker)) {
                    token.transfer(taker, tokenAmount);
                }
                else if (hasRole(SELLER, offer.owner())) {
                    token.transfer(offer.owner(), tokenAmount);
                }
            }

            // canceled after acceptance window
            if (state == State.Initiated && msg.sender != offer.owner()) {
                RepToken repToken = RepToken(market.repToken());
                uint $tokenId = repToken.ownerToTokenId(msg.sender);
                if ($tokenId != 0) {
                    repToken.statsDealExpired($tokenId);
                }
            }

            _state(State.Canceled);
        }
        else revert ActionNotAllowedInThisState(state);
    }

    function dispute() external onlyRole(MEMBER) stateBetween(State.Accepted, State.Paid) {
        assignMediator();
        _state(State.Disputed);
    }

    /// @dev separate method to keep constructor short
    function assignMediator() public {
        address mediator = market.mediator();
        _grantRole(MEMBER, mediator);
        _grantRole(BUYER, mediator);
        _grantRole(SELLER, mediator);
    }

    function message(string calldata message_) external onlyRole(MEMBER) {
        emit Message(msg.sender, message_);
    }

    function feedback(bool upvote, string calldata message_)
    external
    stateBetween(State.Resolved, State.Completed)
    {
        RepToken repToken = RepToken(market.repToken());
        if (msg.sender == offer.owner()) {
            require(!feedbackForTaker.given, "already");
            feedbackForTaker.given = true;
            feedbackForTaker.upvote = upvote;
            feedbackForTaker.message = message_;
            uint $tokenId = repToken.ownerToTokenId(taker);
            if ($tokenId != 0) {
                repToken.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(taker, upvote, message_);
        }
        else if (msg.sender == taker) {
            require(!feedbackForOwner.given, "already");
            feedbackForOwner.given = true;
            feedbackForOwner.upvote = upvote;
            feedbackForOwner.message = message_;
            uint $tokenId = repToken.ownerToTokenId(offer.owner());
            if ($tokenId != 0) {
                repToken.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(offer.owner(), upvote, message_);
        }
    }

    function _state(State state_) private {
        state = state_;
        emit DealState(state, msg.sender);
    }
}
