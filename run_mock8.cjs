// Is there any other place where precision is not respected?
// Look at `getPrice()`
//   function getPrice(IERC20 token_, bytes3 fiat_) public view returns (uint256 price) {
//     // first fetch market TWAP for Uniswap pool of token/USDC
//     if (address(token_) != USDC) {
// ...
//       // price of token_ in USDC (6 decimals)
//       price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);
//     } else {
//       price = 10 ** 6;
//     }
// Wait, in getPrice, `price = 10 ** 6` if `token_ == USDC`.
// WHY is it `10 ** 6` for USDC?
// Because `getPrice` returns price with 6 decimals! So 1 USDC = 1 USD (10**6).
// This is perfectly correct! `getPrice` returns a FIAT PRICE, and fiat prices have 6 decimals!
// What if `fiat_ != USD`?
//     if (fiat_ != bytes3("USD")) { // 0 is USD
//       (, int $fiatToUSD,,,) = fiats[fiat_].latestRoundData();
//       require($fiatToUSD > 0, InvalidArgument());
//       price = price * 10 ** 8 / uint($fiatToUSD);
//     }
// This is also perfectly correct.

// Then the only problem is that USDC decimals are hardcoded to 6 in the early return!
// `if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC)`
// `  return FullMath.mulDiv(amount_, 10 ** 4, denominator);`
// If USDC had 18 decimals, `amount_` (6 decimals) * 10**4 / denominator = 6 decimals.
// But it SHOULD return 18 decimals!
// So it should be `return FullMath.mulDiv(amount_, 10 ** (tokens[USDC].decimals - 6) * 10 ** 4, denominator);`
// Or simply don't early return and let it calculate:
//   uint decimals = tokens[toToken_].decimals;
//   amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
//   return FullMath.mulDiv(amount, 10 ** 4, denominator);
// If it falls through, getPrice(USDC, "USD") returns 10**6.
// `amount = FullMath.mulDiv(amount_, 10 ** decimals, 10**6);`
// `return FullMath.mulDiv(amount, 10 ** 4, denominator);`
// This uses MORE gas than early returning, but we can do:
// ```solidity
//     uint decimals = tokens[toToken_].decimals;
//     if (fromFiat_ == bytes3("USD") && address(toToken_) == USDC) {
//       amount = FullMath.mulDiv(amount_, 10 ** decimals, 10 ** 6);
//     } else {
//       amount = FullMath.mulDiv(amount_, 10 ** decimals, getPrice(toToken_, fromFiat_));
//     }
//     return FullMath.mulDiv(amount, 10 ** 4, denominator);
// ```
// This exactly matches and fixes the precision issue for USDC!
