// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {FullMath} from "../lib/v4-core/src/libraries/FullMath.sol";
import {TickMath} from "../lib/v4-core/src/libraries/TickMath.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {IChainlink} from "./interfaces/IChainlink.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IInventory} from "./interfaces/IInventory.sol";

/**
 * @title Stores available tokens and fiats and provides their rates.
 * @dev This is separate only because of a single contract size limit.
 */
contract Inventory is IInventory, Ownable
{
    using Strings for string;
    using EnumerableSet for EnumerableSet.Bytes32Set;


    mapping(bytes32 => IERC20Metadata)  public token;
    EnumerableSet.Bytes32Set private _tokens;
    EnumerableSet.Bytes32Set private _fiats;
    mapping(bytes32 => IChainlink) private _fiatToUSD;

    IUniswapV3Factory private uniswap;

    constructor(address uniswap_) Ownable(msg.sender) {
        uniswap = IUniswapV3Factory(uniswap_);
    }

    /// @param amount_ must have 4 decimals
    /// @return amount decimals 8
    function convert(uint amount_, string memory fromFiat_, string memory toToken_) public view returns (uint256) {
        return amount_ * 10**4 / getPrice(toToken_, fromFiat_) * 10**4;
    }

    /// @return price with 4 decimals
    function getPrice(string memory token_, string memory fiat_) public view returns (uint256 price) {
        IERC20Metadata $token = token[bytes32(bytes(token_))];
        require(address($token) != address(0), "unknown token");

        price = token_.equal('USDT') ? 10**4 : _requestUniswapRate($token, 500);

        // convert to other currency
        if (!fiat_.equal("USD")) {
            (,int $fiatToUSD,,,) = _fiatToUSD[bytes32(bytes(fiat_))].latestRoundData();
            price = price * 10**8 / uint($fiatToUSD); // $fiat.decimals() is always 8
        }
    }

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
    // ------------------------------------------------------------------------------------

    function addTokens(address[] calldata tokens_) external onlyOwner {
        require(tokens_.length <= type(uint8).max, "symbols length");

        for (uint8 i = 0; i < tokens_.length; i++) {
            IERC20Metadata $token = IERC20Metadata(tokens_[i]);
            bytes32 $symbol = bytes32(bytes($token.symbol()));
            _tokens.add($symbol);
            token[$symbol] = $token;
            emit TokenAdded($token.symbol(), tokens_[i], address($token));
        }
    }
    function removeTokens(string[] calldata token_) external onlyOwner {
        for (uint8 i = 0; i < token_.length; i++) {
            bytes32 $symbol = bytes32(bytes(token_[i]));
            if (_tokens.remove($symbol)) {
                emit TokenRemoved(token_[i], address(token[$symbol]));
                delete token[$symbol];
            }
        }
    }

    function addFiats(string[] calldata fiat_, address[] calldata priceFeed_) external onlyOwner {
        require(fiat_.length == priceFeed_.length, "Market: invalid input length");

        for (uint8 i = 0; i < fiat_.length; i++) {
            bytes32 $fiat = bytes32(bytes(fiat_[i]));
            _fiats.add($fiat);
            // do not check the Set return value to let update feed address
            _fiatToUSD[$fiat] = IChainlink(priceFeed_[i]);
            emit FiatAdded(fiat_[i], priceFeed_[i]);
        }
    }
    function removeFiats(string[] calldata fiat_) external onlyOwner {
        for (uint8 i = 0; i < fiat_.length; i++) {
            bytes32 $fiat = bytes32(bytes(fiat_[i]));
            _fiats.remove($fiat);
            delete _fiatToUSD[$fiat];
            emit FiatRemoved(fiat_[i]);
        }
    }

    function _requestUniswapRate(IERC20Metadata token_, uint24 fee_) internal view returns (uint)
    {
        IERC20Metadata $USDT = token[bytes32(bytes("USDT"))];
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
}
