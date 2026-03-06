// Let's verify:
// `amount_` is 6 decimals.
// `toToken_` is `USDC` with `decimals`.
// `amount = amount_ * 10 ** decimals / 10 ** 6`.
// `result = amount * 10 ** 4 / denominator`.
// Can we do: `FullMath.mulDiv(amount_, 10 ** (4 + decimals), 10 ** 6 * denominator)`
// `10 ** 4 * 10 ** decimals / 10 ** 6` = `10 ** (decimals - 2)`.
// What if decimals < 2? No token has < 2 decimals.
// But we can just write:
// ```solidity
//     uint decimals = tokens[toToken_].decimals;
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) {
//       amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);
//       return FullMath.mulDiv(amount, 10 ** 4, denominator);
//     }
// ```
// Let me look at the code again.
