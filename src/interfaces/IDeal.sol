// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../Deal.sol";
import {IMarket} from "./IMarket.sol";

interface IDeal
{
    event DealState(State state);
    event Message(address indexed sender, string message);

    error InvalidState(State state);

    enum State {
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

    function market() external view returns (IMarket);
    function offerId() external view returns (uint);
    function buyer() external view returns (address);
    function seller() external view returns (address);
    function mediator() external view returns (address);
    function tokenAmount() external view returns (uint256);
    function fiatAmount() external view returns (uint256);
    function fee() external view returns (uint256);
    function paymentInstructions() external view returns (string memory);
    function state() external view returns (State);
}
