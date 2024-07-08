// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IDealFactory
{
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
        string memory paymentInstructions_
    ) external returns (address);
}
