// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Deal.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {Fiat} from "./enums/fiats.sol";
import {Country} from "./enums/countries.sol";
import {PaymentMethodOracle} from "./oracles/PaymentMethodOracle.sol";
import {UUPSUpgradeable} from "../lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Market
 * @dev Emits events to securely broadcast ads, reputation.
 *   Tracks txs and feedback to build reputation.
 */
contract Market is
    IMarket,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    mapping(uint24 => Offer)    public offers;
    uint24 private _nextOfferId;

    mapping(uint32 => Deal)     public deal;
    uint32 private _nextDealId;

    // feedback is in blockchain logs?
    // transactions is in blockchain logs?

    // TODO multiple addresses link rep (in a way protected from DDoS clients when there are too many linked account to fetch logs for)

    function initialize(address initialOwner) initializer external {
        __Ownable_init(initialOwner);
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    struct OfferCreateParams {
        bool isSell;
        address crypto; // ERC20
        Fiat fiat;
        uint price;
        uint min;
        uint max;
        string deliveryMethod;
        uint16 paymentTimeLimit; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        string terms; // FIXME can it be another contract deployed by advertiser?
    }

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
