// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IOffer} from "./interfaces/IOffer.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IDeal} from "./interfaces/IDeal.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";

contract Offer is IOffer, Initializable
{
  // slot 1: address (20) + isSell (1) + rate (2) + fiat (3) + disabled (1) = 27 bytes
  address public owner;
  bool    public isSell;
  uint16  public rate;
  bytes3  public fiat;
  bool    public disabled;

  // slot 2: token (8) + method (16) = 24 bytes
  bytes8  public token;
  bytes16 public method;

  // slot 3
  IOffer.Limits public limits;

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
    require(params.rate > 0, IOffer.InvalidRate());
    require(params.limits.min < params.limits.max, IOffer.InvalidLimits());

    owner = owner_;
    isSell = params.isSell;
    token = params.token;
    fiat = params.fiat;
    method = params.method;
    rate = params.rate;
    limits = params.limits;
    terms = params.terms;
  }

  function createDeal(IMarket market, IOffer.CreateDealParams calldata params)
  external
  {
    require(msg.sender != owner, IMarket.UnauthorizedAccount(msg.sender));
    require(!disabled, IOffer.OfferDisabled());

    uint _tokenAmount = market.convert(params.fiatAmount, fiat, token, rate);

    address impl = market.finder().getImplementationAddress(FinderConstants.DealImplementation);
    IDeal deal = IDeal(Clones.clone(impl));
    deal.initialize(IDeal.DealParams({
      finder: address(market.finder()),
      offer: address(this),
      taker: msg.sender,
      tokenAmount: _tokenAmount,
      fiatAmount: params.fiatAmount
    }));

    market.addDeal(deal, terms, params.paymentInstructions);
  }

  function setRate(uint16 rate_) external {
    require(msg.sender == owner, IMarket.UnauthorizedAccount(msg.sender));
    require(rate_ > 0, IOffer.InvalidRate());
    rate = rate_;
    emit OfferUpdated();
  }

  function setLimits(IOffer.Limits calldata limits_) external {
    require(msg.sender == owner, IMarket.UnauthorizedAccount(msg.sender));
    require(limits_.min < limits_.max, IOffer.InvalidLimits());
    limits = limits_;
    emit OfferUpdated();
  }

  function setTerms(string calldata terms_) external {
    require(msg.sender == owner, IMarket.UnauthorizedAccount(msg.sender));
    terms = terms_;
    emit OfferUpdated();
  }

  function setDisabled(bool disabled_) public {
    require(msg.sender == owner, IMarket.UnauthorizedAccount(msg.sender));
    disabled = disabled_;
    emit OfferUpdated();
  }
}
