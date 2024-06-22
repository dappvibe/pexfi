// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {DealManager} from "./Market/DealManager.sol";
import {Country} from "./enums/countries.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Market
 * @dev Emits events to securely broadcast ads, reputation.
 *   Tracks txs and feedback to build reputation.
 */
contract Market is
    OwnableUpgradeable,
    UUPSUpgradeable,
    IMarket,
    DealManager
{
    using Strings for string;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet internal _tokens;
    mapping(address => Token) public token;

    EnumerableSet.Bytes32Set    internal _fiats;

    address public repToken;

    function initialize(
        address _repToken,
        Token[]  calldata tokens_,
        bytes32[] calldata _addFiats
    ) initializer external
    {
        __Ownable_init(msg.sender);

        repToken = _repToken;

        for(uint8 i = 0; i < tokens_.length; i++) {
            if (_tokens.add(tokens_[i].target)) {
                token[tokens_[i].target] = tokens_[i];
            }
        }
        for(uint8 i = 0; i < _addFiats.length; i++) {
            _fiats.add(_addFiats[i]);
        }

        // 0 values are invalid and Upgradable can't use default values
        _nextOfferId++;
        _nextDealId++;
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    function addToken(Token calldata token_) external onlyOwner {
        if (_tokens.add(token_.target)) {
            token[token_.target] = token_;
        }
    }
    function removeToken(address token_) external onlyOwner {
        if (_tokens.remove(token_)) {
            delete token[token_];
        }
    }
    function tokens() external view returns (Token[] memory) {
        uint256 length = _tokens.length();
        Token[] memory result = new Token[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = token[_tokens.at(i)];
        }
        return result;
    }

    function addFiat(bytes32 fiat_) external onlyOwner {
        _fiats.add(fiat_);
    }
    function removeFiat(bytes32 fiat_) external onlyOwner {
        _fiats.remove(fiat_);
    }
    function fiats() external view returns (bytes32[] memory) {
        return _fiats.values();
    }

    function setRepToken(address _repToken) external onlyOwner {
        repToken = _repToken;
    }
}
