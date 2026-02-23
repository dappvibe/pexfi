// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import {UnauthorizedAccount} from "./libraries/Errors.sol";
import {Market} from "./Market.sol";
import {Deal} from "./Deal.sol";

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

  struct CreateDealParams {
    uint fiatAmount;
    string paymentInstructions;
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

  function createDeal(
    Market market,
    CreateDealParams calldata params
  )
  external
  {
    require(msg.sender != owner, UnauthorizedAccount(msg.sender));
    require(!disabled, "disabled");
    require(market.hasOffer(address(this)), "not registered");

    uint $tokenAmount = market.convert(params.fiatAmount, fiat, token, rate);

    address impl = market.finder().getImplementationAddress(FinderConstants.DealImplementation);
    Deal deal = Deal(Clones.clone(impl));
    deal.initialize(Deal.DealParams({
      market: address(market),
      offer: address(this),
      taker: msg.sender,
      tokenAmount: $tokenAmount,
      fiatAmount: params.fiatAmount
    }));

    market.addDeal(deal, terms, params.paymentInstructions);
  }

  function setRate(uint16 rate_) external {
    require(msg.sender == owner, UnauthorizedAccount(msg.sender));
    require(rate_ > 0, "rate");
    rate = rate_;
    emit OfferUpdated();
  }

  function setLimits(Limits calldata limits_) external {
    require(msg.sender == owner, UnauthorizedAccount(msg.sender));
    require(limits_.min < limits_.max, "limits");
    limits = limits_;
    emit OfferUpdated();
  }

  function setTerms(string calldata terms_) external {
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
