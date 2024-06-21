// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IDealManager} from "../interfaces/IDealManager.sol";
import {OfferManager} from "./OfferManager.sol";

contract DealManager is OfferManager, IDealManager
{
    mapping(uint32 => Deal) public deal;
    uint32 private _nextDealId;

    function createDeal(
        uint24 _offerId,
        uint64 _tokenAmount,
        uint64 _fiatAmount,
        address _mediator
    )
    external returns(uint32)
    {
        Offer memory offer = offers[_offerId];

        deal[_nextDealId] = Deal({
            offer: _offerId,
            state: State.Initiated,
            buyer:  offer.isSell ? msg.sender  : offer.owner,
            seller: offer.isSell ? offer.owner : msg.sender,
            mediator: _mediator,
            fee: 0,
            token0amount: _tokenAmount,
            token1amount: _fiatAmount,
            paymentInstructions: ""
        });

        emit DealCreated(_offerId, _mediator, deal[_nextDealId]);

        _nextDealId++;
        return _nextDealId - 1;
    }
}
