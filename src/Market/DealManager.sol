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

    modifier onlyMediator(uint32 _dealId) {
        require(deals[_dealId].mediator == msg.sender, "only mediator");
        _;
    }
    modifier onlySellerOrMediator(uint32 _dealId) {
        require(deals[_dealId].seller == msg.sender || deals[_dealId].mediator == msg.sender, "only seller");
        _;
    }
    modifier onlyBuyerOrMediator(uint32 _dealId) {
        require(deals[_dealId].buyer == msg.sender || deals[_dealId].mediator == msg.sender, "only buyer");
        _;
    }
    modifier onlyParticipant(uint32 _dealId) {
        require(deals[_dealId].buyer == msg.sender || deals[_dealId].seller == msg.sender || deals[_dealId].mediator == msg.sender, "only participant");
        _;
    }
    modifier onlyOfferOwner(uint32 _dealId) {
        require(offers[deals[_dealId].offerId].owner == msg.sender, "only offer owner");
        _;
    }

    function createDeal(
        uint24 _offerId,
        uint64 _tokenAmount,
        uint64 _fiatAmount,
        address _mediator
    )
    external returns(uint32)
    {
        require(_offerId > 0, "offerId");
        Offer memory offer = offers[_offerId];

        deals[_nextDealId] = Deal({
            offerId: _offerId,
            acceptance: ACCEPTED_MEDIATOR, // mediator automatically accepts for now
            state: State.Initiated,
            buyer: offer.isSell ? msg.sender : offer.owner,
            seller: offer.isSell ? offer.owner : msg.sender,
            mediator: _mediator,
            fee: 0,
            token0amount: _tokenAmount,
            token1amount: _fiatAmount,
            paymentInstructions: ""
        });

        emit DealCreated(_offerId, _mediator, deals[_nextDealId]);

        _nextDealId++;
        return _nextDealId - 1;
    }

    function acceptDeal(uint32 _dealId) external onlyParticipant(_dealId)
    {
        Deal storage deal = deals[_dealId];
        Offer memory offer = offers[deal.offerId];
        if (msg.sender == offer.owner) {
            deal.acceptance |= ACCEPTED_OWNER;
        } else if (msg.sender == deal.mediator) {
            deal.acceptance |= ACCEPTED_MEDIATOR;
        }

        if (deal.acceptance == ACCEPTED_ALL) {
            deal.state = State.Accepted;
            emit DealState(_dealId, deal.mediator, deal.state);

            if (_fundDeal(_dealId)) {
                deal.state = State.Funded;
                emit DealState(_dealId, deal.mediator, deal.state);
            }
        }
    }

    function paidDeal(uint32 _dealId) external onlyBuyerOrMediator(_dealId)
    {
        Deal storage deal = deals[_dealId];
        require(deal.state == State.Funded, "funded");
        deal.state = State.Paid;
        emit DealState(_dealId, deal.mediator, deal.state);
    }

    // @dev transfer tokens to market
    function _fundDeal(uint32 _dealId) private returns(bool)
    {
        Deal memory deal = deals[_dealId];
        IERC20 token = IERC20(offers[deal.offerId].crypto);
        return token.transferFrom(deal.seller, address(this), deal.token0amount);
    }
}
