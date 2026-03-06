let denominator = 10000n; // Say rate is 10000, i.e., 100%
// USD to USDC -> convert(100 USD, USD, USDC, 10000)
// amount_ = 100 * 10**6
let usd_to_usdc = (100n * 10n**6n) * (10n ** 4n) / denominator;
console.log("USD to USDC", usd_to_usdc);

// What if denominator is 9800 (rate 0.98, user wants 2% more token? or 2% less?)
// amount_ = 100 * 10**6
let usd_to_usdc_9800 = (100n * 10n**6n) * (10n ** 4n) / 9800n;
console.log("USD to USDC with rate 0.98", usd_to_usdc_9800);

// So USD to USDC returns amount_ * 10**4 / denominator
// BUT what is the precision of USDC? It's 6 decimals.
// amount_ is already 6 decimals.
// 100 USD -> 100 * 10**6.
// return amount_ * 10**4 / denominator -> returns 100 * 10**6.
// What if toToken is NOT USDC but it's USD fiat?
// wait, the if statement says:
// if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) return FullMath.mulDiv(amount_, 10 ** 4, denominator);
// So it returns USDC precision (6). This is correct.

// NOW what if fromFiat_ == USD, and toToken == USDT (let's say USDT has 6 decimals)
// wait, if toToken == WETH (18 decimals)
// price of WETH in USD: getPrice(WETH, USD)
// say 2000 USD/WETH -> 2000 * 10**6 (6 decimals).
// convert(100 USD, USD, WETH, 10000)
// decimals = 18.
// amount = FullMath.mulDiv(100 * 10**6, 10**18, 2000 * 10**6) -> 0.05 * 10**18 (correct)
// amount = FullMath.mulDiv(amount, 10**4, 10000) -> 0.05 * 10**18 (correct).

// So why is there a FIXME about precision?? Let's check getPrice.
