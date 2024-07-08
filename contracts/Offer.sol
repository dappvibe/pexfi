// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./libraries/Fiats.sol";
import {Methods} from "./libraries/Methods.sol";
import {IOffer} from "./interfaces/IOffer.sol";

contract Offer is Ownable
{
    struct Limits {
        uint32 min;
        uint32 max;
    }

    bool public isSell;
    string public token;
    string public fiat;
    string public method;
    uint16 public rate; // 4 decimals
    Limits public limits;
    string public terms;

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
    Ownable(owner_)
    {
        isSell = isSell_;
        token = token_;
        fiat = fiat_;
        method = method_;
        rate = rate_;
        limits = limits_;
        terms = terms_;
    }

    function setRate(uint16 rate_) public onlyOwner {
        require(rate_ > 0, "rate");
        rate = rate_;
    }
    function setLimits(Limits memory limits_) public onlyOwner {
        require (limits_.min < limits_.max, 'limits');
        limits = limits_;
    }
    function setTerms(string memory terms_) public onlyOwner {
        terms = terms_;
    }
}
