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
import {Tokens} from "./libraries/Tokens.sol";
import "./libraries/Fiats.sol";
import "./libraries/Methods.sol";

/**
 * @title Stores available tokens and fiats and provides their rates.
 * @dev This is separate only because of a single contract size limit.
 */
contract Inventory is IInventory, Ownable
{
    using Strings for string;
    using Tokens for Tokens.Storage;
    using Fiats for Fiats.Storage;
    using Methods   for Methods.Storage;

    Tokens.Storage private tokens;
    Fiats.Storage  private fiats;
    Methods.Storage private methods;

    IUniswapV3Factory private uniswap;

    constructor(address uniswap_) Ownable(msg.sender) {
        uniswap = IUniswapV3Factory(uniswap_);
    }

    /// @param amount_ must have 6 decimals as a fiat amount
    /// @param denominator ratio (4 decimal) to apply to resulting amount
    /// @return $amount of tokens in precision of given token
    function convert(uint amount_, string memory fromFiat_, string memory toToken_, uint denominator) public view returns (uint256 $amount) {
        if (fromFiat_.equal("USD") && toToken_.equal("USDT")) return FullMath.mulDiv(amount_, 10**4, denominator);

        uint decimals = tokens.get(toToken_).decimals;
        $amount = FullMath.mulDiv(amount_, 10**decimals, getPrice(toToken_, fromFiat_));
        return FullMath.mulDiv($amount, 10**4, denominator);
    }

    /// @return price with 4 decimals
    function getPrice(string memory token_, string memory fiat_) public view returns (uint256 price) {
        if (!token_.equal('USDT')) {
            price = _uniswapRateForUSDT(tokens.get(token_));
        }
        else price = 10**6;

        // convert to other currency
        if (!fiat_.equal("USD")) {
            (,int $fiatToUSD,,,) = fiats.get(fiat_).toUSD.latestRoundData();
            price = price * 10**8 / uint($fiatToUSD); // $fiat.decimals() is always 8
        }
    }

    function token(string memory symbol_) external view returns (IERC20Metadata) { return tokens.get(symbol_).api; }
    function getTokens() external view returns (Tokens.Token[] memory) { return tokens.list(); }
    function fiat(string memory symbol_) external view returns (Fiats.Fiat memory) { return fiats.get(symbol_); }
    function getFiats() external view returns (Fiats.Fiat[] memory) { return fiats.list(); }
    function method(string memory symbol_) external view returns (Methods.Method memory) { return methods.get(symbol_); }
    function getMethods() public view returns (Methods.Method[] memory) { return methods.list(); }

    function addTokens(address[] calldata tokens_, uint16 uniswapPoolFee) external onlyOwner {
        for (uint8 i = 0; i < tokens_.length; i++) {
            tokens.add(tokens_[i], uniswapPoolFee);
        }
    }
    function removeTokens(string[] calldata token_) external onlyOwner {
        for (uint8 i = 0; i < token_.length; i++) {
            tokens.remove(token_[i]);
        }
    }
    function addFiats(Fiats.Fiat[] calldata fiats_) external onlyOwner {
        for (uint8 i = 0; i < fiats_.length; i++) {
            fiats.add(fiats_[i]);
        }
    }
    function removeFiats(string[] calldata fiat_) external onlyOwner {
        for (uint8 i = 0; i < fiat_.length; i++) {
            fiats.remove(fiat_[i]);
        }
    }
    function addMethods(Methods.Method[] calldata new_) external onlyOwner {
        for (uint i = 0; i < new_.length; i++) {
            methods.add(new_[i]);
        }
    }
    function removeMethods(string[] calldata names_) external onlyOwner {
        for (uint i = 0; i < names_.length; i++) {
            methods.remove(names_[i]);
        }
    }

    /// @return price of token_ in USDT (6 decimals)
    function _uniswapRateForUSDT(Tokens.Token storage token_) internal view returns (uint)
    {
        IUniswapV3Pool pool = IUniswapV3Pool(uniswap.getPool(
            address(token_.api),
            address(tokens.get("USDT").api),
            token_.uniswapPoolFee
        ));

        uint32[] memory secs = new uint32[](2);
        secs[0] = 300; // 5 minutes TWAP
        secs[1] = 0;
        (int56[] memory tickCumulatives,) = pool.observe(secs);
        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(int24(tickCumulativesDelta / 300));

        // return in USDT (tokenB) precision
        return FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10**token_.decimals, 1 << 192);
    }
}
