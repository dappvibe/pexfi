function convert(amount, decimals, price, denominator) {
   let a = amount * (10n**decimals) / price;
   return a * 10000n / denominator;
}
console.log(convert(100n * 10n**6n, 18n, 1851851851n, 10000n));

// USDC (6 decimals) amount = 100 EUR = 100 * 10**6
let p_usdc = 1000000n * 100000000n / 108000000n; // 925925
console.log(convert(100n * 10n**6n, 6n, p_usdc, 10000n)); // 100000000000000000000 / 925925 = 108000000 (108 USDC)

// Now look at convert method for USD to USDC.
// amount_ = 100 * 10**6
// toToken_ = USDC
// if (fromFiat_ == "USD" && toToken_ == USDC) return amount_ * 10**4 / denominator
// So for USD -> USDC, it returns amount_ (with 6 decimals), adjusted by denominator. This is CORRECT because USDC has 6 decimals!
// But wait! What if toToken_ is not USDC, but USD fiat?
// amount_ is 100 * 10**6.
// decimals of WBTC is 8.
// USD -> WBTC
// getPrice(WBTC, USD) -> 65000 * 10**6 (65k USDC).
// amount_ * 10**8 / (65000 * 10**6)
// = 100 * 10**6 * 10**8 / (65000 * 10**6) = 100 * 10**8 / 65000 = 10000000000 / 65000 = 153846 (0.00153846 WBTC).
// WBTC is 8 decimals, 0.00153846 is 153846. This is CORRECT.

// Now what if token is WETH (18 decimals)
// USD -> WETH
// getPrice(WETH, USD) -> 2000 * 10**6
// amount_ * 10**18 / (2000 * 10**6)
// = 100 * 10**6 * 10**18 / (2000 * 10**6) = 100 * 10**18 / 2000 = 0.05 * 10**18. This is CORRECT.
