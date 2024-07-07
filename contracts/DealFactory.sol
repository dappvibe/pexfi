// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IMarket.sol";
import {IDealFactory} from "./interfaces/IDealFactory.sol";

contract DealFactory is IDealFactory, UUPSUpgradeable, OwnableUpgradeable
{
    IMarket public market;

    function initialize(address market_) public initializer {
        __Ownable_init(msg.sender);
        market = IMarket(market_);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    modifier onlyMarket() {
        require(msg.sender == address(market), "only market");
        _;
    }

    function create(
        address repToken_,
        uint offerId_,
        bool isSell,
        address maker_,
        address taker_,
        address mediator_,
        address token_,
        uint tokenAmount_,
        uint fiatAmount_,
        uint fee_,
        string memory paymentInstructions_
    ) external onlyMarket returns (address) {
        return address(new Deal(
            address(market),
            repToken_,
            offerId_,
            isSell,
            maker_,
            taker_,
            mediator_,
            token_,
            tokenAmount_,
            fiatAmount_,
            fee_,
            paymentInstructions_
        ));
    }
}
