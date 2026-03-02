// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IDeal} from "./interfaces/IDeal.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {IOffer} from "./interfaces/IOffer.sol";
import {FinderConstants} from "./libraries/FinderConstants.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Offer is IOffer, Initializable
{
  // slot 1: address (20) + isSell (1) + rate (2) + fiat (3) + disabled (1) = 27 bytes
  address public owner;
  bool    public isSell;
  uint16  public rate;
  bytes3  public fiat;
  bool    public disabled;

  // slot 2: 32 bytes
  uint256 public methods;

  // slot 3: token (20) + limits (8)
  IERC20 public token;
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
    owner = owner_;
    isSell = params.isSell;
    token = params.token;
    fiat = params.fiat;
    methods = params.methods;
    rate = params.rate;
    limits = params.limits;
    terms = params.terms;
  }

  function createDeal(IMarket market, IOffer.CreateDealParams calldata params)
  external
  {
    if (msg.sender == owner) revert IMarket.UnauthorizedAccount(msg.sender);
    if (disabled) revert IOffer.OfferDisabled();
    bytes16 method = market.methods(params.method); // will panic if out of bounds
    if ((methods & (1 << params.method)) == 0) revert IMarket.InvalidMethod(1 << params.method);
    if (((1 << params.method) & market.disabledMethodsMask()) != 0) revert IMarket.InvalidMethod(market.disabledMethodsMask());

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

    market.addDeal(deal, method, terms, params.paymentInstructions);
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
