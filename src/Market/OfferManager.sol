// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "../interfaces/IOfferManager.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../enums/countries.sol";

contract OfferManager is IOfferManager, OwnableUpgradeable
{
    mapping(uint24 => Offer)    public offers;
    uint24 private _nextOfferId;

    mapping(uint16 => Method) public methods;
    uint16 private _nextMethodId;

    function offerCreate(OfferCreateParams calldata _params) external returns(uint)
    {
        require (_params.fiat != address(0), 'fiat');
        require (_params.price > 0, "price");
        require (_params.min > 0, "min");
        require (_params.max > 0, "max");
        require (_params.min <= _params.max, "minmax");
        require (_params.paymentTimeLimit >= 15, "time");

        Method memory method = methods[_params.method];
        require(bytes(method.name).length > 0, "method");

        offers[_nextOfferId] = Offer({
            owner: msg.sender,
            isSell: _params.isSell,
            crypto: _params.crypto,
            fiat: _params.fiat,
            priceRatio: _params.price,
            fiatMin: _params.min,
            fiatMax: _params.max,
            method: method,
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
        methods[_nextMethodId] = Method({
            name: _name,
            group: _group,
            country: _country
        });

        emit MethodAdded(_nextMethodId, _country, methods[_nextMethodId]);

        _nextMethodId++;
        return _nextMethodId - 1;
    }

    function methodRemove(uint16 _methodId) external onlyOwner
    {
        require(_methodId > 0, "method0");
        require(_methodId < _nextMethodId, "method!ex");

        delete methods[_methodId];
        emit MethodRemoved(_methodId);
    }
}
