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

    struct DealParams {
        address offer;
        uint fiatAmount;
        string paymentInstructions;
    }

    function create(DealParams calldata params)
    external
    {
        Market market = Market(finder.getImplementationAddress(FinderConstants.Market));

        require(market.hasOffer(params.offer), "no offer");

        Offer $offer = Offer(params.offer);
        require(msg.sender != $offer.owner(), UnauthorizedAccount(msg.sender));
        require(!$offer.disabled(), "disabled");

        uint $tokenAmount = market.convert(params.fiatAmount, $offer.fiat(), $offer.token(), $offer.rate());

        Deal deal = Deal(Clones.clone(implementation));
        deal.initialize(Deal.DealParams({
            market: address(market),
            offer: params.offer,
            taker: msg.sender,
            tokenAmount: $tokenAmount,
            fiatAmount: params.fiatAmount,
            paymentInstructions: params.paymentInstructions
        }));

        market.addDeal(deal);
    }
}
