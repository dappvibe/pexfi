// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {DealManager} from "./Market/DealManager.sol";
import {Country} from "./enums/countries.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "./interfaces/IChainlink.sol";
import {TickMath} from "./lib/v4-periphery/lib/v4-core/src

contract Market is
    OwnableUpgradeable,
    UUPSUpgradeable,
    IMarket,
    DealManager
{
    using Strings for string;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    EnumerableSet.Bytes32Set            internal _tokens;
    mapping(bytes32 => IERC20Metadata)  public token;

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

    struct TokenMetadata {
        address target;
        string symbol;
        string name;
        uint8 decimals;
    }
    function tokens() external view returns (TokenMetadata[] memory) {
        uint length = _tokens.length();
        TokenMetadata[] memory result = new TokenMetadata[](length);
        for (uint i = 0; i < length; i++) {
            IERC20Metadata token_ = token[_tokens.at(i)];
            result[i] = TokenMetadata({
                target: address(token_),
                symbol: token_.symbol(),
                name:   token_.name(),
                decimals: token_.decimals()
            });
        }
        return result;
    }

    function fiats() external view returns (bytes32[] memory) {
        return _fiats.values();
    }

    function addTokens(address[] calldata tokens_) external onlyOwner {
        require(tokens_.length <= type(uint8).max, "symbols length");

        for(uint8 i = 0; i < tokens_.length; i++) {
            IERC20Metadata token_ = IERC20Metadata(tokens_[i]);
            bytes32 symbol = _stringToBytes32(token_.symbol());
            _tokens.add(symbol);
            token[symbol] = token_;
            emit TokenAdded(_stringToBytes32(token_.symbol()), tokens_[i], token_);
        }
    }
    function removeTokens(bytes32[] calldata token_) external onlyOwner {
        for(uint8 i = 0; i < token_.length; i++) {
            if (_tokens.remove(token_[i])) {
                emit TokenRemoved(token_[i], address(token[token_[i]]));
                delete token[token_[i]];
            }
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

    function getPrice(bytes32 _token, bytes32 _fiat) external view returns(uint64)
    {
    }

    function setRepToken(address _repToken) external onlyOwner {
        repToken = _repToken;
    }

    function _stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
}
