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
import {IRepToken} from "./interfaces/IRepToken.sol";

contract Market is IMarket,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for string;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.UintSet;

    IRepToken public repToken;
    IUniswapV3Factory public uniswap;

    mapping(bytes32 => IERC20Metadata)  public token;
    EnumerableSet.Bytes32Set private _tokens;
    EnumerableSet.Bytes32Set private _fiats;
    mapping(bytes32 => IChainlink) private _fiatToUSD;
    mapping (bytes32 => Method) public method;
    EnumerableSet.Bytes32Set private _methods;

    mapping(uint => Offer) public offers;
    /// @dev crypto => fiat => method => ids[] ("0" is a special method to list all offers)
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => EnumerableSet.UintSet))) private _sellOffersByPair;
    mapping(bytes32 => mapping(bytes32 => mapping(bytes32 => EnumerableSet.UintSet))) private _buyOffersByPair;
    uint24 private _nextOfferId;


    function initialize(address repToken_, IUniswapV3Factory uniswap_) initializer external {
        __Ownable_init(msg.sender);

        setRepToken(repToken_);
        uniswap = uniswap_;

        // 0 values are invalid and Upgradable can't use default values
        _nextOfferId++;
    }
    function _authorizeUpgrade(address) internal onlyOwner override {}

    struct TokenMetadata {
        address target;
        string symbol;
        string name;
        uint8 decimals;
    }
    function tokens() external view returns (TokenMetadata[] memory) {
        uint $length = _tokens.length();
        TokenMetadata[] memory $result = new TokenMetadata[]($length);
        for (uint i = 0; i < $length; i++) {
            IERC20Metadata $token = token[_tokens.at(i)];
            $result[i] = TokenMetadata({
                target:     address($token),
                symbol:     $token.symbol(),
                name:       $token.name(),
                decimals:   $token.decimals()
            });
        }
        return $result;
    }
    function fiats() external view returns (bytes32[] memory) { return _fiats.values(); }
    function methods() public view returns (bytes32[] memory) { return _methods.values(); }

    function getPrice(string calldata token_, string calldata fiat_) external view returns (uint256 $result) {
        IERC20Metadata $token = token[_stringToBytes32(token_)];
        require(address($token) != address(0), "unknown token");

        $result = token_.equal('USDT') ? 10**4 : _requestUniswapRate($token, 500);

        // convert to other currency
        if (!fiat_.equal("USD")) {
            // $fiat.decimals() is always 8
            $result = $result * 10**8 / getFiatToUSD(fiat_);
        }

        return $result;
    }

    function getFiatToUSD(string calldata fiat_) public view returns (uint) {
        IChainlink $fiat = _fiatToUSD[_stringToBytes32(fiat_)];
        require(address($fiat) != address(0), "Market: unknown fiat");

        (,int $fiatToUSD,,,) = $fiat.latestRoundData();
        return uint($fiatToUSD);
    }


    /// @param isSell_ offers posted by Sellers, i.e. offers to buy tokens for fiat
    /// @param method_ may be empty string to list all offers
    function getOffers(bool isSell_, string calldata token_, string calldata fiat_, string calldata method_)
    external view
    returns (Offer[] memory $offers)
    {
        bytes32 $token = _stringToBytes32(token_);
        bytes32 $fiat = _stringToBytes32(fiat_);
        bytes32 $method = _stringToBytes32(method_);

        EnumerableSet.UintSet storage $offersSet = isSell_ ? _sellOffersByPair[$token][$fiat][$method] : _buyOffersByPair[$token][$fiat][$method];
        uint $length = $offersSet.length();
        $offers = new Offer[]($length);

        for (uint i = 0; i < $length; i++) {
            $offers[i] = offers[$offersSet.at(i)];
        }
    }

    struct OfferCreateParams {
        bool isSell;
        string token;
        string fiat;
        string method;
        uint16 rate; // ratio to multiply market price at time of deal creation (2 decimals)
        uint32 min; // in fiat
        uint32 max;
        uint16 paymentTimeLimit; // protection from stalled deals. after expiry seller can request refund and buyer still gets failed tx recorded
        string terms;
    }
    function offerCreate(OfferCreateParams calldata params_) external {
        require(_tokens.contains(_stringToBytes32(params_.token)), "token not exist");
        require(params_.fiat.equal("USD") || _fiats.contains(_stringToBytes32(params_.fiat)), "fiat not exist");
        require(_methods.contains(_stringToBytes32(params_.method)), "method not exist");
        require (params_.rate > 0, "empty rate");
        require (params_.min > 0, "min");
        require (params_.max > 0, "max");
        require (params_.min <= params_.max, "minmax");
        require (params_.paymentTimeLimit >= 15, "time");

        Offer memory $offer = Offer({
            id: _nextOfferId,
            owner: msg.sender,
            isSell: params_.isSell,
            token: params_.token,
            fiat: params_.fiat,
            method: params_.method,
            rate: params_.rate,
            min: params_.min,
            max: params_.max,
            paymentTimelimit: params_.paymentTimeLimit,
            terms: params_.terms,
            kycRequired: false
        });

        _saveOffer($offer);

        emit OfferCreated(msg.sender, params_.token, params_.fiat, $offer);
    }
    // ---- end of public functions

    function _saveOffer(Offer memory offer_) private {
        offers[_nextOfferId] = offer_;

        bytes32 $token = _stringToBytes32(offer_.token);
        bytes32 $fiat = _stringToBytes32(offer_.fiat);
        bytes32 $method = _stringToBytes32(offer_.method);

        if (offer_.isSell) {
            _sellOffersByPair[$token][$fiat][''].add(offer_.id);
            _sellOffersByPair[$token][$fiat][$method].add(offer_.id);
        } else {
            _buyOffersByPair[$token][$fiat][''].add(offer_.id);
            _buyOffersByPair[$token][$fiat][$method].add(offer_.id);
        }

        _nextOfferId++;
    }

    function addTokens(address[] calldata tokens_) external onlyOwner {
        require(tokens_.length <= type(uint8).max, "symbols length");

        for (uint8 i = 0; i < tokens_.length; i++) {
            IERC20Metadata $token = IERC20Metadata(tokens_[i]);
            bytes32 $symbol = _stringToBytes32($token.symbol());
            _tokens.add($symbol);
            token[$symbol] = $token;
            emit TokenAdded(_stringToBytes32($token.symbol()), tokens_[i], $token);
        }
    }
    function removeTokens(bytes32[] calldata token_) external onlyOwner {
        for (uint8 i = 0; i < token_.length; i++) {
            if (_tokens.remove(token_[i])) {
                emit TokenRemoved(token_[i], address(token[token_[i]]));
                delete token[token_[i]];
            }
        }
    }

    function addFiats(bytes32[] calldata fiat_, address[] calldata priceFeed_) external onlyOwner {
        require(fiat_.length == priceFeed_.length, "Market: invalid input length");

        for (uint8 i = 0; i < fiat_.length; i++) {
            _fiats.add(fiat_[i]);
            // do not check the Set return value to let update feed address
            _fiatToUSD[fiat_[i]] = IChainlink(priceFeed_[i]);
            emit FiatAdded(fiat_[i], priceFeed_[i]);
        }
    }
    function removeFiats(bytes32[] calldata fiat_) external onlyOwner {
        for (uint8 i = 0; i < fiat_.length; i++) {
            _fiats.remove(fiat_[i]);
            delete _fiatToUSD[fiat_[i]];
            emit FiatRemoved(fiat_[i]);
        }
    }

    function addMethods(Method[] calldata new_) external onlyOwner {
        for (uint i = 0; i < new_.length; i++) {
            if (_methods.add(new_[i].name)) {
                method[new_[i].name] = new_[i];
                emit MethodAdded(new_[i].name, new_[i]);
            }
        }
    }
    function removeMethods(bytes32[] calldata names_) external onlyOwner {
        for (uint i = 0; i < names_.length; i++) {
            if (_methods.remove(names_[i])) {
                delete method[names_[i]];
                emit MethodRemoved(names_[i]);
            }
        }
    }

    function setRepToken(address repToken_) public onlyOwner {
        repToken = IRepToken(repToken_);
    }

    function _requestUniswapRate(IERC20Metadata token_, uint24 fee_) internal view returns (uint)
    {
        IERC20Metadata $USDT = token[_stringToBytes32("USDT")];
        require(address($USDT) != address(0), "USDT not found");

        address $poolAddress = uniswap.getPool(address(token_), address($USDT), fee_);
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
        uint256 numerator2 = 10**(token_.decimals() - $USDT.decimals() + 4); // precision after dot
        return FullMath.mulDiv(numerator1, numerator2, 1 << 192);
    }

    function _stringToBytes32(string memory source_) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source_);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source_, 32))
        }
    }
}
