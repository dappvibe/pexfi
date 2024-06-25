// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {Market} from "./Market.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Deal is IDeal, AccessControl
{
    using Strings for string;

    Market public market;
    //IMarket.Offer private offer;
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
    uint    private allowCancelUnacceptedAfter;
    uint    private allowCancelUnpaidAfter = 999999999999999;
    uint    private paymentWindow;
    State   public state = State.Initiated;

    uint8 private constant ACCEPTED_MEDIATOR = 1;
    uint8 private constant ACCEPTED_OWNER    = 2;
    uint8 private constant ACCEPTED_ALL      = 3;

    bytes32 private constant MEDIATOR    = 'MEDIATOR';
    bytes32 private constant SELLER      = 'SELLER';
    bytes32 private constant BUYER       = 'BUYER';
    bytes32 private constant MEMBER      = 'MEMBER';
    bytes32 private constant OFFER_OWNER = 'OFFER_OWNER';


    modifier stateBetween(State from_, State to_) {
        if (state < from_ || state > to_) revert ActionNotAllowedInThisState(state);
        _;
    }

    constructor(
        uint offerId_,
        bool isSell,
        address maker_,
        address taker_,
        address mediator_,
        IERC20Metadata token_,
        uint tokenAmount_,
        uint fiatAmount_,
        uint fee_,
        string memory paymentInstructions_,
        uint allowCancelUnacceptedAfter_,
        uint paymentWindow_
    )
    {
        market = Market(msg.sender);
        offerId = offerId_;
        buyer = isSell ? taker_ : maker_;
        seller = isSell ? maker_ : taker_;
        mediator = mediator_;
        token = token_;
        tokenAmount = tokenAmount_;
        fiatAmount = fiatAmount_;
        fee = fee_;
        paymentInstructions = paymentInstructions_;
        allowCancelUnacceptedAfter = allowCancelUnacceptedAfter_;
        paymentWindow = paymentWindow_;

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
            state = State.Accepted;
            emit DealState(state);

            if (seller == msg.sender) {
                market.fundDeal();
                state = State.Funded;
                emit DealState(State.Funded);
            }

            allowCancelUnpaidAfter = block.timestamp + paymentWindow;
        }
    }

    function paid() external onlyRole(BUYER) stateBetween(State.Accepted, State.Funded) {
        state = State.Paid;
        emit DealState(state);
    }

    function release() external onlyRole(SELLER) stateBetween(State.Funded, State.Disputed) {
        token.transfer(buyer, tokenAmount - (tokenAmount * fee / 10000));
        token.transfer(mediator, token.balanceOf(address(this)));

        state = State.Completed;
        emit DealState(state);
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
            state = State.Canceled;
            emit DealState(State.Canceled);
        }
        else revert ActionNotAllowedInThisState(state);
    }

    function dispute() external onlyRole(MEMBER) stateBetween(State.Accepted, State.Paid) {
        state = State.Disputed;
        emit DealState(State.Disputed);
    }

    function message(string calldata message_) external onlyRole(MEMBER) {
        emit Message(msg.sender, message_);
    }
}
