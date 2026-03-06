// What if we just remove the early return?
// If we remove:
// ```solidity
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)
//       return FullMath.mulDiv(amount_, 10 ** 4, denominator);
// ```
// And just let it fall through:
// `uint decimals = tokens[toToken_].decimals;`
// `amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));`
// `getPrice(USDC, "USD")` -> returns `10 ** 6`.
// `amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);`
// `return FullMath.mulDiv(amount, 10 ** 4, denominator);`
// This exactly correctly converts `amount_` from 6 decimals to `decimals` and applies `denominator`!
// Wait! If `address(toToken_) == USDC`, `getPrice(USDC, "USD")` returns `10 ** 6`.
// So `amount = amount_ * 10 ** decimals / 10 ** 6`.
// THIS IS PERFECT!
// Why did they have the early return?
// Probably an optimization, but it's WRONG because it assumes USDC has 6 decimals!
// If we just remove it? Or maybe keep it but fix it:
// `if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) {`
// `  uint decimals = tokens[USDC].decimals;`
// `  amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);`
// `  return FullMath.mulDiv(amount, 10 ** 4, denominator);`
// `}`
