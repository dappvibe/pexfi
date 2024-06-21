// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IDealManager
{
    event DealCreated(uint24 indexed offerId, address indexed mediator, Deal deal);

    struct Deal {
        uint24 offer;
        State state;
        // party receiving tokens
        address buyer;

        // party giving tokens
        address seller;

        // party receiving fee
        address mediator;
        uint fee;
        //address policy; // ??? govern deal rules by another contract ??

        uint token0amount;
        uint token1amount;

        string paymentInstructions;
    }

    enum State {
        // This is an internal state to represent an uninitialized transaction.
        Null,                     // 0
        Initiated,                // 1
        Accepted,                 // 2
        Disputed,                 // 3
        Escalated,                // 4
        Revoked,                  // 5
        RefundedByMediator,       // 6
        SettledByMediator,        // 7
        ConfirmedByMediator,      // 8
        Confirmed,                // 9
        Refunded,                 // 10
        ConfirmedAfterExpiry,     // 11
        ConfirmedAfterDispute,    // 12
        RefundedAfterDispute,     // 13
        RefundedAfterExpiry,      // 14
        ConfirmedAfterEscalation, // 15
        RefundedAfterEscalation,  // 16
        Settled                   // 17
    }
}
