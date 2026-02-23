// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UnauthorizedAccount} from "./libraries/Errors.sol";

contract Offer is Initializable
{
  event OfferUpdated();

  struct Limits {
    uint32 min;
    uint32 max;
  }

  struct OfferParams {
    bool isSell;
    uint16 rate;
    Limits limits;
    bytes8 token;
    bytes3 fiat;
    bytes16 method;
    string terms;
  }

  // slot 1: address (20) + isSell (1) + rate (2) + fiat (3) + disabled (1) = 27 bytes
  address public owner;
  bool public isSell;
  uint16 public rate;
  bytes3 public fiat;
  bool public disabled;

  // slot 2: token (8) + method (16) = 24 bytes
  bytes8 public token;
  bytes16 public method;

  // slot 3
  Limits public limits;

  // dynamic
  string public terms;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(
    address owner_,
    OfferParams calldata params
  )
  external
  initializer
  {
    owner = owner_;
    isSell = params.isSell;
    token = params.token;
    fiat = params.fiat;
    method = params.method;
    rate = params.rate;
    limits = params.limits;
    terms = params.terms;
  }

  function setRate(uint16 rate_) external {
    require(msg.sender == owner, UnauthorizedAccount(msg.sender));
    require(rate_ > 0, "rate");
    rate = rate_;
    emit OfferUpdated();
  }

  function setLimits(Limits memory limits_) public {
    require(msg.sender == owner, UnauthorizedAccount(msg.sender));
    require(limits_.min < limits_.max, "limits");
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
