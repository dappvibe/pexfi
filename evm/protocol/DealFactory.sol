// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Offer} from "./Offer.sol";
import {Market} from "./Market.sol";
import {Deal} from "./Deal.sol";
import "./libraries/Errors.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";

contract DealFactory is UUPSUpgradeable, OwnableUpgradeable
{
    FinderInterface public finder;

    function initialize(address finder_) public initializer {
        __Ownable_init(msg.sender);
        finder = FinderInterface(finder_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function create(address offer_, uint fiatAmount_, string memory paymentInstructions_)
    external
    {
        Market market = Market(finder.getImplementationAddress(FinderConstants.Market));

        require(market.hasOffer(offer_), "no offer");

        Offer $offer = Offer(offer_);
        require(msg.sender != $offer.owner(), UnauthorizedAccount(msg.sender));
        require(!$offer.disabled(), "disabled");

        uint $tokenAmount = market.convert(fiatAmount_, $offer.fiat(), $offer.token(), $offer.rate());

        Deal deal = new Deal(
            address(market),
            offer_,
            msg.sender,
            $tokenAmount,
            fiatAmount_,
            paymentInstructions_
        );

        market.addDeal(deal);
    }
}
