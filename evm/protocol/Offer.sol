// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Methods} from "./libraries/Methods.sol";
import {UnauthorizedAccount} from "./libraries/Errors.sol";

contract Offer
{
    event OfferUpdated();

    struct Limits {
        uint32 min;
        uint32 max;
    }

    address public immutable owner;
    bool public immutable isSell;
    string public token;
    string public fiat;
    string public method;
    uint16 public rate; // 4 decimals
    Limits public limits;
    string public terms;
    bool public disabled;

    constructor(
        address owner_,
        bool isSell_,
        string memory token_,
        string memory fiat_,
        string memory method_,
        uint16 rate_, // 4 decimals
        Limits memory limits_,
        string memory terms_
    )
    {
        owner = owner_;
        isSell = isSell_;
        token = token_;
        fiat = fiat_;
        method = method_;
        rate = rate_;
        limits = limits_;
        terms = terms_;
    }

    function setRate(uint16 rate_) external {
        require(msg.sender == owner, UnauthorizedAccount(msg.sender));
        require(rate_ > 0, "rate");
        rate = rate_;
        emit OfferUpdated();
    }
    function setLimits(Limits memory limits_) public {
        require(msg.sender == owner, UnauthorizedAccount(msg.sender));
        require (limits_.min < limits_.max, 'limits');
        limits = limits_;
        emit OfferUpdated();
    }
    function setTerms(string memory terms_) public {
        require(msg.sender == owner, UnauthorizedAccount(msg.sender));
        terms = terms_;
        emit OfferUpdated();
    }
    function setDisabled(bool disabled_) public {
        require(msg.sender == owner, UnauthorizedAccount(msg.sender));
        disabled = disabled_;
        emit OfferUpdated();
    }
}
