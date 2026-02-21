// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Market} from "./Market.sol";
import {Offer} from "./Offer.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";

contract OfferFactory is Ownable
{
    using Strings for *;

    FinderInterface public finder;
    address public implementation;

    constructor(address finder_) Ownable(msg.sender) {
        finder = FinderInterface(finder_);
    }

    function setImplementation(address implementation_) external onlyOwner {
        implementation = implementation_;
    }

    /// @dev check immutable props here to reduce Offer contract size
    function create(Offer.OfferParams calldata params)
    external
    {
        require(params.rate > 0, "rate");
        require(params.limits.min < params.limits.max, 'minmax');

        Market market = Market(finder.getImplementationAddress(FinderConstants.Market));

        market.getPrice(params.token, params.fiat); // this validates both token and fiat
        require(market.convert(params.limits.min, params.fiat, 'USDC', 10000) > 20, 'min too low');
        market.method(params.method);               // validate method

        Offer offer = Offer(Clones.clone(implementation));
        offer.initialize(
            msg.sender,
            params
        );

        // register this offer to market
        market.addOffer(offer);
    }
}
