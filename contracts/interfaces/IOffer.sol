// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Methods} from "../libraries/Methods.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Fiats} from "../libraries/Fiats.sol";

interface IOffer {
    function newDeal() external;
    function setRate(uint16 rate_) external;
    function setLimits(uint32 min, uint32 max) external;
    function setTerms(string memory terms_) external;
    function isSell() external view returns (bool);
    function token() external view returns (IERC20Metadata);
    function fiat() external view returns (Fiats.Fiat memory);
    function method() external view returns (Methods.Method memory);
    function rate() external view returns (uint16);
    function limits() external view returns (uint32 min, uint32 max);
    function terms() external view returns (string memory);
}
