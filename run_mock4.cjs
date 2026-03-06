// Ah! Wait, look at this!
// amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
// Let's say:
// amount_ = 100 EUR = 100 * 10^6
// decimals = 18 (WETH)
// getPrice(WETH, EUR) = 3474.67 * 10^6 (price of 1 WETH in EUR, 6 decimals)
// amount = 100 * 10^6 * 10^18 / (3474.67 * 10^6) = (100 / 3474.67) * 10^18 = 0.02878 * 10^18.
// This is exactly the CORRECT AMOUNT IN TARGET PRECISION.
// BUT WAIT.
// Look at `return FullMath.mulDiv(amount, 10 ** 4, denominator);`
// WAIT, the formula is:
// `FullMath.mulDiv(amount, 10 ** 4, denominator);`
// If denominator is 10000. It returns `amount * 10^4 / 10^4 = amount`.
// This is STILL correct!

// Let me look at the issue description again.
// "The amount of tokens returned by the convert function does not respect the precision of the given token."
// Could it be that `amount_` is NOT fiat?
// "amount of tokens in precision of given token"
// What if `amount_` is in token precision? NO.
// `amount_` is `uint amount_, bytes3 fromFiat_, IERC20 toToken_, uint denominator`
// "amount_ must have 6 decimals as a fiat amount"

// Wait! Look at `if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)`
// `return FullMath.mulDiv(amount_, 10 ** 4, denominator);`
// What if `USDC` decimals is NOT 6?
// Wait, `tokens[toToken_].decimals` is NOT used for USDC.
// Does USDC always have 6 decimals on all chains? NO!
// On BSC, USDC (Binance-Peg) has 18 decimals!
// If `amount_` is 6 decimals.
// `return FullMath.mulDiv(amount_, 10 ** 4, denominator);` returns 6 decimals!
// BUT USDC ON BSC HAS 18 DECIMALS!
// So if `amount_` is 100 * 10^6.
// It returns 100 * 10^6.
// But the target precision is 18 decimals! So it returns 0.0000000001 USDC!
// THIS IS THE BUG!
// We MUST respect `tokens[toToken_].decimals` even for USDC!

// Also, what if we use `convert()` for USDC, but not USD?
// If `fromFiat_` != USD, but `toToken_` == USDC:
// `decimals = tokens[toToken_].decimals`
// `amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));`
// `getPrice(USDC, EUR)` -> `price = 10^6`
// `price = price * 10**8 / fiatToUSD = 10^6 * 10^8 / 1.08*10^8 = 925925`
// `amount = 100 * 10^6 * 10^decimals / 925925`.
// If USDC has 18 decimals, `amount = 100 * 10^6 * 10^18 / 925925 = 108 * 10^18`.
// THIS RESPECTS DECIMALS!
// It is ONLY the early return `if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)` that FAILS to respect decimals!
