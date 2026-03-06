// What if we just do:
// ```solidity
//     uint decimals = tokens[toToken_].decimals;
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) {
//       amount = FullMath.mulDiv(amount_, 10 ** (decimals + 4), 10 ** 6 * denominator);
//       return amount;
//     }
// ```
// But wait, `amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);`
// `return FullMath.mulDiv(amount, 10 ** 4, denominator);`
// This uses two multiplications to avoid overflow, or is cleaner.
// Actually, `10 ** (decimals + 4)` is fine since decimals <= 18 usually.
// Let's just do:
// ```solidity
//     uint decimals = tokens[toToken_].decimals;
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) {
//       amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);
//     } else {
//       amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
//     }
//     return FullMath.mulDiv(amount, 10 ** 4, denominator);
// ```
// It's perfectly clear and clean.
