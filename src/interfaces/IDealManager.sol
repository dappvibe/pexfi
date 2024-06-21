// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IDealManager
{
    event DealCreated(uint24 indexed offerId, address indexed mediator, Deal deal);
    event DealState(uint32 indexed dealId, address indexed mediator, State state);
    event Message(uint32 indexed dealId, address indexed sender, string message);

    struct Deal {
        uint32 id;
        uint24 offerId;
        uint8 acceptance; // bitmap
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
        Invalid,                  //
        Initiated,                //
        Accepted,                 //
        Funded,                   //
        Paid,
        Disputed,                 //
        Revoked,                  //
        RefundedByMediator,       //
        SettledByMediator,        //
        ConfirmedByMediator,      //
        Confirmed,                //
        Refunded,                 //
        ConfirmedAfterExpiry,     //
        ConfirmedAfterDispute,    //
        RefundedAfterDispute,     //
        RefundedAfterExpiry,      //
        ConfirmedAfterEscalation, //
        RefundedAfterEscalation,  //
        Settled,
        Completed
    }
}
