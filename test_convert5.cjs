// What if toToken_ is NOT USDC but has a different precision, say WETH?
// The first check is:
// if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)
//   return FullMath.mulDiv(amount_, 10 ** 4, denominator);

// Wait, what if USDC does not have 6 decimals? But USDC DOES have 6 decimals.
// What if the fiat amount_ is not 6 decimals? The doc says "amount_ must have 6 decimals as a fiat amount".

// Let's check getPrice.
// Token price:
// price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);
// wait!
// sqrtPriceX96 is the price of token_ in USDC? Or USDC in token_?
// Usually, Uniswap pool is Token/WETH or Token/USDC.
// If it's Token/USDC, and Token is token0, USDC is token1.
// sqrtPriceX96 is price of token0 in terms of token1.
// so price = (sqrtPriceX96 ** 2 / 2**192).
// This gives the price in token1 per token0.
// Is it multiplied by 10**token.decimals?
// If token0 has 18 decimals and token1 has 6 decimals,
// true_price = (sqrtPriceX96 ** 2 / 2**192) * (10 ** (decimals_token0 - decimals_token1)) ?
// Wait, the formula in getPrice is:
// price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);
// The Uniswap pool ratio gives the token amount. Let's write a quick uniswap price script.
