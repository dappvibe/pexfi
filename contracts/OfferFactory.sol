// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IMarket.sol";
import "./Offer.sol";
import "./Market.sol";

contract OfferFactory is UUPSUpgradeable, OwnableUpgradeable
{
    using Strings for *;

    Market public market;

    function initialize(address market_) public initializer {
        __Ownable_init(msg.sender);
        market = Market(market_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint private constant MIN_USDT_VOLUME = 20;

    function create(
        bool isSell,
        string memory token,
        string memory fiat,
        string memory method,
        uint16 rate, // 4 decimals
        Offer.Limits memory limits,
        string memory terms
    )
    external
    {
        // check immutable props here to reduce Offer size and save gas on deployments
        require (limits.min < limits.max, 'minmax');
        require(!market.method(method).name.equal(''), "method NE");
        require(market.getPrice(token, fiat) != 0, "pair");

        // convert min to USD and check offers' minimum
        require(market.convert(limits.min, fiat, 'USDT', 10000) > MIN_USDT_VOLUME, 'min too low');

        Offer offer = new Offer(
            isSell,
            market.token(token).symbol(),
            fiat,
            method,
            rate,
            limits,
            terms
        );

        // register this offer to market
        market.listOffer(offer);
    }
}
