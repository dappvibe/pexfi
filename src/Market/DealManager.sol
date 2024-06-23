// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IDealManager} from "../interfaces/IDealManager.sol";
import {OfferManager} from "./OfferManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DealManager is OfferManager, IDealManager
{
    uint8 constant internal ACCEPTED_MEDIATOR = 1;
    uint8 constant internal ACCEPTED_OWNER = 2;
    uint8 constant internal ACCEPTED_ALL = 3;

    mapping(uint32 => Deal) public deals;
    uint32 internal _nextDealId;

    modifier onlyMediator(uint32 dealId_) {
        require(deals[dealId_].mediator == msg.sender, "only mediator");
        _;
    }
    modifier onlySellerOrMediator(uint32 dealId_) {
        require(deals[dealId_].seller == msg.sender || deals[dealId_].mediator == msg.sender, "only seller");
        _;
    }
    modifier onlyBuyerOrMediator(uint32 dealId_) {
        require(deals[dealId_].buyer == msg.sender || deals[dealId_].mediator == msg.sender, "only buyer");
        _;
    }
    modifier onlyParticipant(uint32 dealId_) {
        require(deals[dealId_].buyer == msg.sender || deals[dealId_].seller == msg.sender || deals[dealId_].mediator == msg.sender, "only participant");
        _;
    }
    modifier onlyOfferOwner(uint32 dealId_) {
        require(offers[deals[dealId_].offerId].owner == msg.sender, "only offer owner");
        _;
    }
    modifier dealState(uint32 dealId_, State lessThan_) {
        require(deals[dealId_].state < lessThan_, "state");
        _;
    }

    function createDeal(
        uint24 offerId_,
        uint64 tokenAmount_,
        uint64 fiatAmount_,
        address mediator_
    )
    external returns (uint32)
    {
        require(offerId_ > 0, "offerId");
        Offer storage offer = offers[offerId_];

        deals[_nextDealId] = Deal({
            id: _nextDealId,
            offerId: offerId_,
            acceptance: ACCEPTED_MEDIATOR, // mediator automatically accepts for now
            state: State.Initiated,
            buyer: offer.isSell ? msg.sender : offer.owner,
            seller: offer.isSell ? offer.owner : msg.sender,
            mediator: mediator_,
            fee: 0,
            token0amount: tokenAmount_,
            token1amount: fiatAmount_,
            paymentInstructions: ""
        });

        emit DealCreated(offerId_, mediator_, deals[_nextDealId]);

        _nextDealId++;
        return _nextDealId - 1;
    }

    function acceptDeal(uint32 dealId_) external onlyParticipant(dealId_) {
        Deal storage deal = deals[dealId_];
        if (msg.sender == offers[deal.offerId].owner) {
            deal.acceptance |= ACCEPTED_OWNER;
        } else if (msg.sender == deal.mediator) {
            deal.acceptance |= ACCEPTED_MEDIATOR;
        }

        if (deal.acceptance == ACCEPTED_ALL) {
            deal.state = State.Accepted;
            emit DealState(dealId_, deal.mediator, deal.state);

            if (_fundDeal(dealId_)) {
                deal.state = State.Funded;
                emit DealState(dealId_, deal.mediator, deal.state);
            }
        }
    }

    function paidDeal(uint32 dealId_) external onlyBuyerOrMediator(dealId_) {
        Deal storage deal = deals[dealId_];
        deal.state = State.Paid;
        emit DealState(dealId_, deal.mediator, deal.state);
    }

    function completeDeal(uint32 dealId_) external onlySellerOrMediator(dealId_) {
        Deal storage deal = deals[dealId_];
        require(deal.state < State.Completed, "completed");

        IERC20 $token = IERC20(offers[deal.offerId].crypto);
        $token.transfer(deal.buyer, deal.token0amount);

        deal.state = State.Completed;
        emit DealState(dealId_, deal.mediator, deal.state);
    }

    function cancelDeal(uint32 dealId_) external onlyBuyerOrMediator(dealId_) {
        Deal storage deal = deals[dealId_];
        require(deal.state < State.Completed, "completed");

        if (deal.state == State.Funded) {
            IERC20 $token = IERC20(offers[deal.offerId].crypto);
            $token.transfer(deal.seller, deal.token0amount);
        }

        deal.state = State.Revoked;
        emit DealState(dealId_, deal.mediator, deal.state);
    }

    function disputeDeal(uint32 dealId_) external onlyParticipant(dealId_) {
        Deal storage deal = deals[dealId_];
        require(deal.state < State.Disputed, "disputed");

        deal.state = State.Disputed;
        emit DealState(dealId_, deal.mediator, deal.state);
    }

    function message(uint32 dealId_, string calldata message_) external onlyParticipant(dealId_) {
        emit Message(dealId_, msg.sender, message_);
    }

    // @dev transfer tokens to market
    function _fundDeal(uint32 dealId_) private returns (bool) {
        Deal memory deal = deals[dealId_];
        IERC20 token = IERC20(offers[deal.offerId].crypto);
        return token.transferFrom(deal.seller, address(this), deal.token0amount);
    }
}
