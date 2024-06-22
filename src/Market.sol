// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
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
    DealManager,
    RepManager
{
    using Strings for string;

    mapping(string => address) public tokens; // supported ERC20 tokens, key is symbol
    mapping(string => uint16)  public fiats;  // supported fiat currencies, key is ISO 4217 code, value is latest price to USDT or 0 if no info

    // feedback is in blockchain logs?
    // transactions is in blockchain logs?
    // TODO multiple addresses link rep (in a way protected from DDoS clients when there are too many linked account to fetch logs for)

    function initialize(
        string[] calldata _tokenSymbols,
        address[] calldata _tokenAddresses,
        string[] calldata _fiats
    ) initializer external
    {
        require(_tokenSymbols.length == _tokenAddresses.length, "token mismatch");

        __Ownable_init(msg.sender);

        // price related
        for(uint8 i = 0; i < _tokenSymbols.length; i++) {
            tokens[_tokenSymbols[i]] = _tokenAddresses[i];
        }
        for(uint8 i = 0; i < _fiats.length; i++) {
            fiats[_fiats[i]] = 1; // Initialize with a default value
        }

        // 0 values are invalid and Upgradable can't use default values
        _nextOfferId++;
        _nextDealId++;
        _nextMethodId++;
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    function addToken(string calldata symbol, address token_) external onlyOwner {
        tokens[symbol] = token_;
    }
    function removeToken(string calldata symbol) external onlyOwner {
        delete tokens[symbol];
    }
    function addFiat(string calldata code, uint16 price) external onlyOwner {
        fiats[code] = price;
    }
    function removeFiat(string calldata code) external onlyOwner {
        delete fiats[code];
    }
}
