// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "./interfaces/IOfferManager.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../enums/countries.sol";

contract OfferManager is IOfferManager, OwnableUpgradeable
{
    mapping(uint24 => Offer)    public offers;
    uint24 private _nextOfferId;

    mapping(uint16 => Method) public deliveryMethods;
    uint16 private _nextDeliveryMethodId;

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

    function methodAdd(string calldata _name, MethodGroup _group, Country _country) external onlyOwner returns(uint16)
    {
        deliveryMethods[_nextDeliveryMethodId] = Method({
            name: _name,
            group: _group,
            country: _country
        });

        emit MethodAdded(_nextDeliveryMethodId, _country, deliveryMethods[_nextDeliveryMethodId]);

        _nextDeliveryMethodId++;
        return _nextDeliveryMethodId - 1;
    }

    function methodRemove(uint16 _methodId) external onlyOwner
    {
        delete deliveryMethods[_methodId];
        emit MethodRemoved(_methodId);
    }
}
