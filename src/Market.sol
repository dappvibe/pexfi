// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "../lib/openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {OfferManager} from "./Market/OfferManager.sol";
import {DealManager} from "./Market/DealManager.sol";
import {RepManager} from "./Market/RepManager.sol";
import {Country} from "./enums/countries.sol";
import {Strings} from "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import {IUniswapOracle} from "./interfaces/IUniswapOracle.sol";

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
    using Strings for string;

    mapping(string => address) public tokens; // supported ERC20 tokens, key is symbol
    mapping(string => uint16)  public fiats;  // supported fiat currencies, key is ISO 4217 code, value is latest price to USDT or 0 if no info

    IUniswapOracle private uniswapOracle;

    // feedback is in blockchain logs?
    // transactions is in blockchain logs?
    // TODO multiple addresses link rep (in a way protected from DDoS clients when there are too many linked account to fetch logs for)

    function initialize(
        address initialOwner,
        address _uniswapOracle,
        string[] calldata _tokenSymbols,
        address[] calldata _tokenAddresses,
        string[] calldata _fiats
    ) initializer external
    {
        require(_tokenSymbols.length == _tokenAddresses.length, "token mismatch");

        __Ownable_init(initialOwner);

        // price related
        setUniswapOracle(_uniswapOracle);
        for(uint8 i = 0; i < _tokenSymbols.length; i++) {
            tokens[_tokenSymbols[i]] = _tokenAddresses[i];
        }
        for(uint8 i = 0; i < _fiats.length; i++) {
            fiats[_fiats[i]] = 1; // Initialize with a default value
        }

        // mark default mapping value as invalid so that not found is not confused with valid data
        methods[0] = Method('', MethodGroup.Other, Country.GLOBAL);
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

    function setUniswapOracle(address _uniswapOracle) public onlyOwner {
        uniswapOracle = IUniswapOracle(_uniswapOracle);
    }

    function getPrice(string calldata _token, string calldata _fiat)
    external view
    returns (uint64)
    {
        address tokenAddress = tokens[_token];
        require(tokenAddress != address(0), 'token not supported');
        require(fiats[_fiat] != 0, 'fiat not supported');

        string memory fiat = 'USD';

        // first get token to USDT value
        (uint64 tokenToUsd,) = uniswapOracle.getPrice(tokenAddress, tokens['USDT'], 1, 300); // 5 min twap

        return tokenToUsd;
    }
}
