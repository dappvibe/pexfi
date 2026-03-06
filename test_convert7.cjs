// What if we do:
// amount_ is 6 decimals.
// token.decimals is the target precision.
// amount = amount_ * 10 ** token.decimals / 10**6
// So if USDC has 18 decimals, 100 USD (100 * 10**6) -> 100 * 10**6 * 10**18 / 10**6 = 100 * 10**18 (Correct!)
// So we should do:
// if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)
//   return FullMath.mulDiv(amount_, 10 ** tokens[toToken_].decimals, 10 ** 6 * denominator / 10 ** 4); ?
// wait, we need to apply denominator.
// `return FullMath.mulDiv(amount_, 10 ** 4, denominator);` applies rate correctly if `amount_` and `amount` have the same precision.
// Because amount_ is 6 decimals. It returns 6 decimals.
// If USDC has 18 decimals, it should return 18 decimals.
// So `FullMath.mulDiv(amount_, 10 ** tokens[toToken_].decimals * 10 ** 4, 10 ** 6 * denominator)`
// Is that it?
