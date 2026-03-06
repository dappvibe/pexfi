// Ah! Look at Market.sol, line 157:
// amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
// return FullMath.mulDiv(amount, 10 ** 4, denominator);

// Wait, the FIXME is on convert!
// "/// @return amount of tokens in precision of given token // FIXME precision is not respected"
// If getPrice() has 6 decimals, and amount_ has 6 decimals.
// amount = amount_ * 10**decimals / price
// Let's say amount_ is 100 * 10**6
// toToken is USDC (decimals = 6)
// fromFiat is EUR (price = 10**6 * 10**8 / 1.08*10**8 = 925925)
// amount = 100 * 10**6 * 10**6 / 925925 = 108000108 (108 USDC, 6 decimals).
// This is CORRECT!

// What if toToken is WETH (decimals = 18)?
// fromFiat is USD
// amount_ = 100 * 10**6
// price of WETH is 2000 * 10**6 (2000 USD)
// amount = 100 * 10**6 * 10**18 / (2000 * 10**6) = 0.05 * 10**18 (18 decimals).
// This is CORRECT!

// So why does it say precision is not respected?
// Let's check `if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)`
// return FullMath.mulDiv(amount_, 10 ** 4, denominator);
// amount_ has 6 decimals.
// return amount_ * 10**4 / denominator.
// USDC has 6 decimals. So this returns amount with 6 decimals!
// What if USDC decimals is not 6? In some chains, USDC has 18 decimals! (e.g. BSC, some bridges)
// Is USDC assumed to be 6 decimals?
// Well, `amount_` is a fiat amount, so it always has 6 decimals.
// If USDC has 18 decimals, then `return FullMath.mulDiv(amount_, 10 ** 4, denominator);` will return 6 decimals!
// It would give 100 USDC but as `100 * 10**6` instead of `100 * 10**18`.
// This means precision is NOT respected for USDC if USDC decimals != 6!
// Wait! The fiat amount `amount_` has 6 decimals.
// The code `return FullMath.mulDiv(amount_, 10 ** 4, denominator);`
// literally just returns 6 decimals. It assumes `toToken_` has 6 decimals because it's USDC.
// But what if we should use `toToken_.decimals` instead of assuming 6?
// If we want it to be in `toToken_` precision, we should do:
// amount_ is 6 decimals.
// We want to return amount_ * 10**USDC.decimals / 10**6
