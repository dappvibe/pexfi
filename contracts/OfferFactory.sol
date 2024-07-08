// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./Offer.sol";
import "./Market.sol";

contract OfferFactory is UUPSUpgradeable, OwnableUpgradeable
{
    using Strings for *;

    Market public market;
    uint private constant MIN_USDT_VOLUME = 20;

    function initialize(address market_) public initializer {
        __Ownable_init(msg.sender);
        market = Market(market_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

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
        market.getPrice(token_, fiat_); // this validates both token and fiat
        require(market.convert(limits_.min, fiat_, 'USDT', 10000) > MIN_USDT_VOLUME, 'min too low');
        market.method(method_);         // validate method

        Offer offer = new Offer(
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
