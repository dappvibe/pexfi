// Ah! In getPrice:
// `price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);`
// If USDC is token1: price is in USDC/token.
// ratio = (2000 * 10**6) / (1 * 10**18) = 2 * 10**-9
// price = (2 * 10**-9) * 10**18 = 2000 * 10**9 = 2,000,000,000,000.
// This is 9 decimals! NOT 6 decimals!
// But wait, the function comment says `/// @return price with 6 decimals`
// BUT it does not return 6 decimals! It returns `token.decimals - 18 + 6`? No.
// Let's re-examine carefully.
// Uniswap price returns token1 / token0.
// BUT what if USDC is token0? Then price is token / USDC.
// We must get the price correctly regardless of token0/token1.
// Also, the getPrice function doesn't check if token_ is token0 or token1.
// It just assumes `sqrtPriceX96` is what it needs. But `sqrtPriceX96` is ALWAYS token1/token0.
