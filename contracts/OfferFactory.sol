// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IMarket.sol";
import "./Offer.sol";
import "./Market.sol";

contract OfferFactory is UUPSUpgradeable, OwnableUpgradeable
{
    Market public market;

    function initialize(address market_) public initializer {
        __Ownable_init(msg.sender);
        market = Market(market_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier onlyMarket() {
        require(msg.sender == address(market), "only market");
        _;
    }

    function create(bool isSell,
        string memory token,
        string memory fiat,
        string memory method,
        uint16 rate, // 4 decimals
        Offer.Limits memory limits,
        string memory terms
    )
    external
    returns(address)
    {
        Offer offer = new Offer(isSell, market.token(token), fiat, market.method(method), rate, limits, terms);
        market.listOffer(offer);
        return address(offer);
    }
}
