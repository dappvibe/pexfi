// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./interfaces/IOfferManager.sol";

contract OfferManager is IOfferManager
{
    mapping(uint24 => Offer)    public offers;
    uint24 private _nextOfferId;

    function offerCreate(OfferCreateParams calldata _params) external returns(uint)
    {
        offers[_nextOfferId] = Offer({
            owner: msg.sender,
            isSell: _params.isSell,
            crypto: _params.crypto,
            fiat: _params.fiat,
            priceRatio: _params.price,
            fiatMin: _params.min,
            fiatMax: _params.max,
            deliveryMethod: _params.deliveryMethod,
            paymentTimelimit: _params.paymentTimeLimit,
            terms: _params.terms,
            kycRequired: false,
            active: true
        });

        emit OfferCreated(_params.isSell, _params.crypto, _params.fiat, _nextOfferId, offers[_nextOfferId]);

        _nextOfferId++;
        return _nextOfferId - 1;
    }
}
