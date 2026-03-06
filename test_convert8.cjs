// What about the rest of the function?
//   uint decimals = tokens[toToken_].decimals;
//   amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
//   return FullMath.mulDiv(amount, 10 ** 4, denominator);
// Is this correct?
// amount_ is 6 decimals.
// getPrice is 6 decimals.
// amount = amount_ * 10**decimals / price -> returns `decimals` precision!
// Then return amount * 10**4 / denominator -> still `decimals` precision!
// So this IS correct.
// Then where is the precision NOT respected?
// What if getPrice() doesn't return 6 decimals?
// Let's check getPrice():
// "/// @return price with 6 decimals"
// "price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);"
// Wait!
// sqrtPriceX96 is the Uniswap pool price of token in terms of USDC.
// Or is it USDC in terms of token?
// In Uniswap V3, price is always token1 / token0.
// But we don't know if USDC is token0 or token1!
// If token is token0 and USDC is token1:
// sqrtPriceX96 = sqrt(USDC / token) * 2^96
// price = sqrtPriceX96^2 / 2^192 = USDC / token
// This means it's the price of 1 token in terms of USDC.
// But wait! Is this price scaled?
// (USDC / token) is a ratio of raw balances.
// Raw USDC has 6 decimals. Raw token has token.decimals decimals.
// So ratio = (USDC_amount * 10**6) / (token_amount * 10**token.decimals) ??
// No, Uniswap ratio is simply amount1 / amount0.
// Let's say 1 ETH = 2000 USDC.
// 10**18 wei ETH = 2000 * 10**6 mUSDC.
// So ratio = 2000 * 10**6 / 10**18 = 2000 * 10**-12 = 2 * 10**-9.
// So sqrtPriceX96^2 / 2^192 = 2 * 10**-9.
// Then getPrice calculates:
// price = (sqrtPriceX96^2 / 2^192) * 10 ** token.decimals
// price = (2 * 10**-9) * 10**18 = 2000 * 10**9.
// Wait! This is 2000 * 10**9, NOT 2000 * 10**6!
// It has 9 decimals, NOT 6 decimals!
