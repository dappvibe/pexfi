pragma solidity ^0.8.0;

contract Deal
{
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
    State public state;

    address public offer;

    // party receiving tokens
    address public buyer;

    // party giving tokens
    address public seller;

    // party receiving fee
    address public mediator;
    uint public fee;
    address public policy; // ??? govern deal rules by another contract ??

    string public token0;
    string public token1;
    uint public token0amount;
    uint public token1amount;

    string public paymentInstructions;
    uint public paymentMethod;

    constructor(){

    }
}
