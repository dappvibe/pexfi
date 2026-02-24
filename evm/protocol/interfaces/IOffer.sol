// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.34;

import {IMarket} from "./IMarket.sol";

interface IOffer {
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
    uint256 fiatAmount;
    string paymentInstructions;
  }

  event OfferUpdated();

  function initialize(address owner_, OfferParams calldata params) external;

  function createDeal(IMarket market, CreateDealParams calldata params) external;

  function setRate(uint16 rate_) external;

  function setLimits(Limits calldata limits_) external;

  function setTerms(string calldata terms_) external;

  function setDisabled(bool disabled_) external;

  function owner() external view returns (address);

  function isSell() external view returns (bool);

  function rate() external view returns (uint16);

  function fiat() external view returns (bytes3);

  function disabled() external view returns (bool);

  function token() external view returns (bytes8);

  function method() external view returns (bytes16);

  function limits() external view returns (uint32 min, uint32 max);

  function terms() external view returns (string memory);
}
