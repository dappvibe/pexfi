// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "../interfaces/IOfferManager.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../enums/countries.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract OfferManager is IOfferManager, OwnableUpgradeable
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(uint24 => Offer)    public offers;
    uint24 internal _nextOfferId;

    /**
    * @dev Allows enabled methods to be listed with methods(). Ensures that the method is not already added.
    */
    EnumerableSet.Bytes32Set    internal _methods;
    mapping (bytes32 => Method) public method;

    function offerCreate(OfferCreateParams calldata _params) external returns(uint)
    {
        require (_params.fiat != address(0), 'fiat');
        require (_params.price > 0, "price");
        require (_params.min > 0, "min");
        require (_params.max > 0, "max");
        require (_params.min <= _params.max, "minmax");
        require (_params.paymentTimeLimit >= 15, "time");
        require(_methods.contains(_params.method), "method");

        offers[_nextOfferId] = Offer({
            id: _nextOfferId,
            owner: msg.sender,
            isSell: _params.isSell,
            crypto: _params.crypto,
            fiat: _params.fiat,
            priceRatio: _params.price,
            fiatMin: _params.min,
            fiatMax: _params.max,
            method: _params.method,
            country: _params.country,
            paymentTimelimit: _params.paymentTimeLimit,
            terms: _params.terms,
            kycRequired: false,
            active: true
        });

        emit OfferCreated(msg.sender, _params.crypto, _params.fiat, offers[_nextOfferId]);

        _nextOfferId++;
        return _nextOfferId - 1;
    }

    function addMethods(Method[] calldata _new) external onlyOwner
    {
        for (uint i = 0; i < _new.length; i++) {
            if (_methods.add(_new[i].name)) {
                method[_new[i].name] = _new[i];
                emit MethodAdded(_new[i].name, _new[i]);
            }
        }
    }

    function methods() public view returns (bytes32[] memory)
    {
        return _methods.values();
    }

    function removeMethods(bytes32[] calldata _names) external onlyOwner
    {
        for (uint i = 0; i < _names.length; i++) {
            if (_methods.remove(_names[i])) {
                delete method[_names[i]];
                emit MethodRemoved(_names[i]);
            }
        }
    }
}
