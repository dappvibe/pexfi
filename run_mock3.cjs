// What if token0 is USDC and token1 is the Token?
// `ratio` is Token_amount / USDC_amount.
// `ratio = (Token_human * 10^token.decimals) / (USDC_human * 10^6)`
// `ratio = (Token_human / USDC_human) * 10^(token.decimals - 6)`
// `ratio * 10^token.decimals = (Token_human / USDC_human) * 10^(2*token.decimals - 6)`
// This gives the WRONG value!
// But the code ASSUMES `address(token_) < USDC` or whatever because it doesn't check `token0` or `token1`.
// Actually, `sqrtPriceX96` is just the Uniswap price.
// Wait, is Uniswap always created with token0 < token1? YES.
// If address(token_) > USDC, then token_ is token1 and USDC is token0.
// Then ratio = token_ / USDC.
// The code `uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(int24(tickCumulativesDelta / 300));`
// always calculates based on `token1/token0`.
// Wait, `tokens[token_].pool` gives us the Uniswap pool.
// The code doesn't read the pool's token0/token1. It just gets `sqrtPriceX96` at tick!
// If `address(token_) > USDC`, `token_` is token1!
// If `token_` is token1, `ratio` is `amount1 / amount0`, which is `token_ / USDC`!
// But `getPrice` ASSUMES the pool ratio is always `USDC / token_` because of `price = FullMath.mulDiv(...)`.
// BUT THAT IS NOT THE BUG BEING FIXED.
// The issue says:
// /// @return amount of tokens in precision of given token // FIXME precision is not respected
// function convert(uint amount_, bytes3 fromFiat_, IERC20 toToken_, uint denominator)
