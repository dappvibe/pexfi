// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {FinderInterface} from "@uma/core/contracts/data-verification-mechanism/interfaces/FinderInterface.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import "./Offer.sol";

import "./Market.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

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
    /// @param rate_ Multiplier to apply to market price (4 decimals)
    function create(
        bool isSell_,
        string memory token_,
        string memory fiat_,
        string memory method_,
        uint16 rate_,
        Offer.Limits memory limits_,
        string memory terms_
    )
    external
    {
        require(rate_ > 0, "rate");
        require(limits_.min < limits_.max, 'minmax');

        Market market = Market(finder.getImplementationAddress(FinderConstants.Market));

        market.getPrice(token_, fiat_); // this validates both token and fiat
        require(market.convert(limits_.min, fiat_, 'USDC', 10000) > 20, 'min too low');
        market.method(method_);         // validate method

        Offer offer = Offer(Clones.clone(implementation));
        offer.initialize(
            msg.sender,
            isSell_,
            token_,
            fiat_,
            method_,
            rate_,
            limits_,
            terms_
        );

        // register this offer to market
        market.addOffer(offer);
    }
}
