// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {DealManager} from "./Market/DealManager.sol";
import {Country} from "./enums/countries.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./interfaces/IChainlink.sol";

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
    mapping(address => Token) public token; // TODO will it be better to use IERC20?

    EnumerableSet.Bytes32Set       internal _fiats;
    mapping(bytes32 => IChainlink) internal _fiatToUSD;

    address public repToken;
    address public uniswapOracle;

    function initialize(address _repToken, address _uniswapOracle) initializer external
    {
        __Ownable_init(msg.sender);

        repToken = _repToken;
        uniswapOracle = _uniswapOracle;

        // 0 values are invalid and Upgradable can't use default values
        _nextOfferId++;
        _nextDealId++;
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    function tokens() external view returns (Token[] memory) {
        uint256 length = _tokens.length();
        Token[] memory result = new Token[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = token[_tokens.at(i)];
        }
        return result;
    }

    function fiats() external view returns (bytes32[] memory) {
        return _fiats.values();
    }

    function addTokens(Token[] calldata token_) external onlyOwner {
        for(uint8 i = 0; i < token_.length; i++) {
            if (_tokens.add(token_[i].target)) {
                token[token_[i].target] = token_[i];
                emit TokenAdded(token_[i].symbol, token_[i].target, token_[i]);
            }
        }
    }
    function removeTokens(address[] calldata token_) external onlyOwner {
        for(uint8 i = 0; i < token_.length; i++) {
            _tokens.remove(token_[i]);
            delete token[token_[i]];
            emit TokenRemoved(token[token_[i]].symbol, token_[i]);
        }
    }

    function addFiats(bytes32[] calldata fiat_, address[] calldata priceFeed_) external onlyOwner {
        require(fiat_.length == priceFeed_.length, "Market: invalid input length");
        for(uint8 i = 0; i < fiat_.length; i++) {
            _fiats.add(fiat_[i]);
            // do not check the Set return value to let update feed address
            _fiatToUSD[fiat_[i]] = IChainlink(priceFeed_[i]);
            emit FiatAdded(fiat_[i], priceFeed_[i]);
        }
    }
    function removeFiats(bytes32[] calldata fiat_) external onlyOwner {
        for(uint8 i = 0; i < fiat_.length; i++) {
            _fiats.remove(fiat_[i]);
            delete _fiatToUSD[fiat_[i]];
            emit FiatRemoved(fiat_[i]);
        }
    }

    function setRepToken(address _repToken) external onlyOwner {
        repToken = _repToken;
    }
}
