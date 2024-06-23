// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IOfferManager} from "../interfaces/IOfferManager.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract OfferManager is IOfferManager, OwnableUpgradeable
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(uint24 => Offer) public offers;
    uint24 internal _nextOfferId;

    /**
    * @dev Allows enabled methods to be listed with methods(). Ensures that the method is not already added.
    */
    EnumerableSet.Bytes32Set internal _methods;
    mapping (bytes32 => Method) public method;

    function offerCreate(OfferCreateParams calldata params_) external returns (uint) {
        require (params_.fiat != address(0), 'fiat');
        require (params_.price > 0, "price");
        require (params_.min > 0, "min");
        require (params_.max > 0, "max");
        require (params_.min <= params_.max, "minmax");
        require (params_.paymentTimeLimit >= 15, "time");
        require(_methods.contains(params_.method), "method");

        offers[_nextOfferId] = Offer({
            id: _nextOfferId,
            owner: msg.sender,
            isSell: params_.isSell,
            crypto: params_.crypto,
            fiat: params_.fiat,
            priceRatio: params_.price,
            fiatMin: params_.min,
            fiatMax: params_.max,
            method: params_.method,
            country: params_.country,
            paymentTimelimit: params_.paymentTimeLimit,
            terms: params_.terms,
            kycRequired: false,
            active: true
        });

        emit OfferCreated(msg.sender, params_.crypto, params_.fiat, offers[_nextOfferId]);

        _nextOfferId++;
        return _nextOfferId - 1;
    }

    function addMethods(Method[] calldata new_) external onlyOwner {
        for (uint i = 0; i < new_.length; i++) {
            if (_methods.add(new_[i].name)) {
                method[new_[i].name] = new_[i];
                emit MethodAdded(new_[i].name, new_[i]);
            }
        }
    }

    function removeMethods(bytes32[] calldata names_) external onlyOwner {
        for (uint i = 0; i < names_.length; i++) {
            if (_methods.remove(names_[i])) {
                delete method[names_[i]];
                emit MethodRemoved(names_[i]);
            }
        }
    }

    function methods() public view returns (bytes32[] memory) {
        return _methods.values();
    }
}
