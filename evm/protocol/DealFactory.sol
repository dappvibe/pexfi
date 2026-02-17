// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Offer} from "./Offer.sol";
import {Market} from "./Market.sol";
import {Deal} from "./Deal.sol";
import "./libraries/Errors.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract DealFactory is Ownable
{
    FinderInterface public finder;
    address public implementation;

    constructor(address finder_) Ownable(msg.sender) {
        finder = FinderInterface(finder_);
    }

    function setImplementation(address implementation_) external onlyOwner {
        implementation = implementation_;
    }

    function create(address offer_, uint fiatAmount_, string memory paymentInstructions_)
    external
    {
        Market market = Market(finder.getImplementationAddress(FinderConstants.Market));

        require(market.hasOffer(offer_), "no offer");

        Offer $offer = Offer(offer_);
        require(msg.sender != $offer.owner(), UnauthorizedAccount(msg.sender));
        require(!$offer.disabled(), "disabled");

        uint $tokenAmount = market.convert(fiatAmount_, $offer.fiat(), $offer.token(), $offer.rate());

        Deal deal = Deal(Clones.clone(implementation));
        deal.initialize(
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
