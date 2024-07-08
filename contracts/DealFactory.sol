// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Offer} from "./Offer.sol";
import {Market} from "./Market.sol";
import {Deal} from "./Deal.sol";

contract DealFactory is UUPSUpgradeable, OwnableUpgradeable
{
    Market public market;

    function initialize(address market_) public initializer {
        __Ownable_init(msg.sender);
        market = Market(market_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function create(address offer_, uint fiatAmount_, string memory paymentInstructions_)
    external
    {
        require(market.hasOffer(offer_), "no offer");

        Offer $offer = Offer(offer_);
        require(msg.sender != $offer.owner(), "self");

        uint $tokenAmount = market.convert(fiatAmount_, $offer.fiat(), $offer.token(), $offer.rate());

        Deal deal = new Deal(
            address(market),
            offer_,
            msg.sender,
            $tokenAmount,
            fiatAmount_,
            paymentInstructions_
        );

        market.trackDeal(deal);
    }
}
