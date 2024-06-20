// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "../lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./Market/interfaces/IMarket.sol";
import {OfferManager} from "./Market/OfferManager.sol";
import {DealManager} from "./Market/DealManager.sol";
import {RepManager} from "./Market/RepManager.sol";
import {Country} from "./enums/countries.sol";

/**
 * @title Market
 * @dev Emits events to securely broadcast ads, reputation.
 *   Tracks txs and feedback to build reputation.
 */
contract Market is
    OwnableUpgradeable,
    UUPSUpgradeable,
    IMarket,
    OfferManager,
    DealManager,
    RepManager
{
    // feedback is in blockchain logs?
    // transactions is in blockchain logs?

    // TODO multiple addresses link rep (in a way protected from DDoS clients when there are too many linked account to fetch logs for)

    function initialize(address initialOwner) initializer external {
        __Ownable_init(initialOwner);

        // mark default mapping value as invalid so that not found is not confused with valid data
        methods[0] = Method('', MethodGroup.Other, Country.GLOBAL);
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}
}
