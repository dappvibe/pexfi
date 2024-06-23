// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {FullMath} from "../lib/v4-core/src/libraries/FullMath.sol";
import {TickMath} from "../lib/v4-core/src/libraries/TickMath.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IChainlink} from "./interfaces/IChainlink.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IMarket} from "./interfaces/IMarket.sol";
import {DealManager} from "./Market/DealManager.sol";
import {IRepManager} from "./interfaces/IRepManager.sol";

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

    IRepManager     public repToken;
    IUniswapV3Factory  public uniswap;

    function initialize(address _repToken, IUniswapV3Factory _uniswap) initializer external
    {
        __Ownable_init(msg.sender);

        setRepToken(_repToken);
        uniswap = _uniswap;

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

    function getPrice(string calldata _token, string calldata _fiat) external view returns(uint256 $result)
    {
        IERC20Metadata $token = token[_stringToBytes32(_token)];
        require(address($token) != address(0), "unknown token");

        $result = _requestUniswapRate($token, 500);

        // convert to other currency
        if (!_fiat.equal("USD")) {
            IChainlink $fiat = _fiatToUSD[_stringToBytes32(_fiat)];
            require(address($fiat) != address(0), "Market: unknown fiat");

            (,int256 $ratio,,,) = $fiat.latestRoundData();
            uint128 $unsignedRatio = uint128(uint($ratio));
            $result = $result * $unsignedRatio / 10**$fiat.decimals();
        }

        return $result;
    }

    function setRepToken(address _repToken) public onlyOwner {
        repToken = IRepManager(_repToken);
    }

    function _requestUniswapRate(IERC20Metadata $token, uint24 $fee) internal view returns(uint)
    {
        IERC20Metadata $USDT = token[_stringToBytes32("USDT")];
        require(address($USDT) != address(0), "USDT not found");

        address $poolAddress = uniswap.getPool(address($token), address($USDT), $fee);
        require($poolAddress != address(0), "Market: pool not found");

        IUniswapV3Pool $pool = IUniswapV3Pool($poolAddress);

        uint32[] memory secs = new uint32[](2);
        secs[0] = 300;
        secs[1] = 0;
        (int56[] memory tickCumulatives,) = IUniswapV3Pool($pool).observe(secs);
        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
        int24 arithmeticMeanTick = int24(tickCumulativesDelta / 300);
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(arithmeticMeanTick);

        uint256 numerator1 = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
        uint256 numerator2 = 10**($token.decimals() - $USDT.decimals() + 2); // include cents
        return FullMath.mulDiv(numerator1, numerator2, 1 << 192);
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
