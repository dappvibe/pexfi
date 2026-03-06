// Price ratio = 3.47467e-9
// If token0 is WETH (18 decimals), token1 is USDC (6 decimals).
// true_price = ratio * 10^(18 - 6) = 3.47467e-9 * 10^12 = 3474.67
// So 1 WETH = 3474.67 USDC.
// This matches!
// But wait!
// The price returned by getPrice:
// `price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);`
// `sqrtPriceX96` is sqrt(ratio) * 2^96.
// `sqrtPriceX96^2 / 2^192` is `ratio`.
// So `price = ratio * 10 ** token.decimals`
// For WETH, price = 3.47467e-9 * 10^18 = 3.47467e9 = 3,474,670,000.
// Is this 6 decimals?
// 3474.67 * 10^6 = 3,474,670,000.
// YES! It is EXACTLY 6 decimals!
// Let me verify this.
// `ratio` is USDC_amount / WETH_amount (raw wei values).
// `ratio = (USDC_human * 10^6) / (WETH_human * 10^18)`
// `ratio = (USDC_human / WETH_human) * 10^-12`
// `ratio * 10^18 = (USDC_human / WETH_human) * 10^6`.
// WHICH IS EXACTLY THE PRICE IN USDC WITH 6 DECIMALS!
// This works perfectly if token1 is USDC!
