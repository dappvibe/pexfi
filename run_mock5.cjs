// Is this correct?
// ```solidity
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)
//       return FullMath.mulDiv(amount_, 10 ** tokens[toToken_].decimals, 10 ** 6) * 10 ** 4 / denominator;
// ```
// Wait, `amount_` has 6 decimals.
// `amount_ * 10 ** decimals / 10 ** 6` will give it `decimals` precision.
// Then apply denominator: `* 10 ** 4 / denominator`.
// Can we do: `FullMath.mulDiv(amount_, 10 ** (4 + tokens[toToken_].decimals), 10 ** 6 * denominator)`
// Yes.

// Wait, let's look at the comment again:
// /// @return amount of tokens in precision of given token // FIXME precision is not respected
// function convert(uint amount_, bytes3 fromFiat_, IERC20 toToken_, uint denominator)

// What about the second part?
//     uint decimals = tokens[toToken_].decimals;
//     amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
//     return FullMath.mulDiv(amount, 10 ** 4, denominator);

// If amount_ is 100 * 10^6.
// `amount = 100 * 10^6 * 10^decimals / getPrice(toToken_, fromFiat_)`
// Since getPrice returns 6 decimals.
// `amount = (fiat_amount * 10^6) * 10^decimals / (fiat_price * 10^6)`
// `amount = (fiat_amount / fiat_price) * 10^decimals`.
// This is exactly `decimals` precision.
// So the second part IS respecting precision perfectly!
// The ONLY issue is the first part!
