// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./interfaces/IOfferManager.sol";

contract OfferManager is IOfferManager
{
    mapping(uint24 => Offer)    public offers;
    uint24 private _nextOfferId;

    function offerCreate(OfferCreateParams calldata _params) external returns(uint)
    {
        require (_params.price > 0, "price must be greater than 0");
        require (_params.min <= _params.max, "min must be less than or equal to max");
        require (_params.min > 0, "min must be greater than 0");
        require (_params.max > 0, "max must be greater than 0");
        require (_params.paymentTimeLimit >= 15, "paymentTimeLimit must be greater or equal to 15 minutes");

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
