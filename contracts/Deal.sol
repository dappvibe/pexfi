// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {Market} from "./Market.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IRepToken} from "./interfaces/IRepToken.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Deal is IDeal, AccessControl
{
    using Strings for string;

    // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
    uint16 private ACCEPTANCE_TIME = 15 minutes;
    uint16 private PAYMENT_WINDOW  = 1 hours;

    uint8 private constant ACCEPTED_MEDIATOR = 1;
    uint8 private constant ACCEPTED_OWNER    = 2;
    uint8 private constant ACCEPTED_ALL      = 3;

    bytes32 private constant MEDIATOR    = 'MEDIATOR';
    bytes32 private constant SELLER      = 'SELLER';
    bytes32 private constant BUYER       = 'BUYER';
    bytes32 private constant MEMBER      = 'MEMBER';
    bytes32 private constant OFFER_OWNER = 'OFFER_OWNER';

    uint    public offerId;
    address public buyer;
    address public seller;
    address public mediator;
    IERC20Metadata public token;
    uint    public tokenAmount;
    uint    public fiatAmount;
    uint    public fee;
    string  public paymentInstructions;
    uint8   public acceptance = 1; // mediator autoaccept for now
    uint    public allowCancelUnacceptedAfter;
    uint    public allowCancelUnpaidAfter = 999999999999999;
    State   public state = State.Initiated;
    Market private market;
    IRepToken private repToken;

    struct Feedback {
        bool given;
        bool upvote;
        string message;
    }
    Feedback public feedbackForSeller;
    Feedback public feedbackForBuyer;

    modifier stateBetween(State from_, State to_) {
        if (state < from_ || state > to_) revert ActionNotAllowedInThisState(state);
        _;
    }

    constructor(
        IRepToken repToken_,
        uint offerId_,
        bool isSell,
        address maker_,
        address taker_,
        address mediator_,
        IERC20Metadata token_,
        uint tokenAmount_,
        uint fiatAmount_,
        uint fee_,
        string memory paymentInstructions_
    )
    {
        market = Market(msg.sender);
        repToken = repToken_;
        offerId = offerId_;
        buyer = isSell ? taker_ : maker_;
        seller = isSell ? maker_ : taker_;
        mediator = mediator_;
        token = token_;
        tokenAmount = tokenAmount_;
        fiatAmount = fiatAmount_;
        fee = fee_;
        paymentInstructions = paymentInstructions_;
        allowCancelUnacceptedAfter = block.timestamp + ACCEPTANCE_TIME;

        _grantRole(OFFER_OWNER, maker_);
        _grantRole(MEDIATOR, mediator);
        _grantRole(SELLER, seller);
        _grantRole(BUYER, mediator);
        _grantRole(SELLER, mediator);
        _grantRole(BUYER, buyer);
        _grantRole(MEMBER, mediator);
        _grantRole(MEMBER, seller);
        _grantRole(MEMBER, buyer);
    }

    function accept() external onlyRole(MEMBER) stateBetween(State.Initiated, State.Initiated) {
        if (hasRole(OFFER_OWNER, msg.sender)) {
            acceptance |= ACCEPTED_OWNER;
        } else if (hasRole(MEDIATOR, msg.sender)) {
            acceptance |= ACCEPTED_MEDIATOR;
        }

        if (acceptance == ACCEPTED_ALL) {
            _state(State.Accepted);

            if (seller == msg.sender) {
                market.fundDeal();
                _state(State.Funded);
            }

            allowCancelUnpaidAfter = block.timestamp + PAYMENT_WINDOW;
        }
    }

    function paid() external onlyRole(BUYER) stateBetween(State.Accepted, State.Funded) {
        _state(State.Paid);
    }

    function release() external onlyRole(SELLER) stateBetween(State.Funded, State.Disputed) {
        token.transfer(buyer, tokenAmount - (tokenAmount * fee / 10000));
        token.transfer(mediator, token.balanceOf(address(this)));

        _state(State.Completed);

        uint $tokenId = repToken.ownerToTokenId(buyer);
        if ($tokenId != 0) {
            repToken.statsDealCompleted($tokenId);
        }
        $tokenId = repToken.ownerToTokenId(seller);
        if ($tokenId != 0) {
            repToken.statsDealCompleted($tokenId);
        }
    }

    function cancel() external onlyRole(MEMBER) {
        if (state < State.Accepted
        || (hasRole(BUYER, msg.sender) && state < State.Canceled)
        || (hasRole(SELLER, msg.sender) && (
                (state < State.Paid && block.timestamp > allowCancelUnpaidAfter) ||
                (state < State.Accepted && block.timestamp > allowCancelUnacceptedAfter)
            ))
        )
        {
            if (state == State.Funded) {
                token.transfer(seller, tokenAmount);
            }
            _state(State.Canceled);
        }
        else revert ActionNotAllowedInThisState(state);
    }

    function dispute() external onlyRole(MEMBER) stateBetween(State.Accepted, State.Paid) {
        _state(State.Disputed);
    }

    function message(string calldata message_) external onlyRole(MEMBER) {
        emit Message(msg.sender, message_);
    }

    function feedback(bool upvote, string calldata message_) external {
        if (hasRole(SELLER, msg.sender) && !feedbackForBuyer.given) {
            feedbackForBuyer.given = true;
            feedbackForBuyer.upvote = upvote;
            feedbackForBuyer.message = message_;
            uint $tokenId = repToken.ownerToTokenId(buyer);
            if ($tokenId != 0) {
                repToken.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(buyer, upvote, message_);
        }
        else if (hasRole(BUYER, msg.sender) && !feedbackForSeller.given) {
            feedbackForSeller.given = true;
            feedbackForSeller.upvote = upvote;
            feedbackForSeller.message = message_;
            uint $tokenId = repToken.ownerToTokenId(seller);
            if ($tokenId != 0) {
                repToken.statsVote($tokenId, upvote);
            }
            emit FeedbackGiven(seller, upvote, message_);
        }
    }

    function _state(State state_) private {
        state = state_;
        emit DealState(state);
    }
}
