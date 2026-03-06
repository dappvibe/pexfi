// Let's look at getPrice again:
// ```
//       Token memory token = tokens[token_];
//       uint32[] memory secs = new uint32[](2);
//       secs[0] = 300;
//       secs[1] = 0;
//       (int56[] memory tickCumulatives,) = token.pool.observe(secs);
//       int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
//       uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(int24(tickCumulativesDelta / 300));
//       price = FullMath.mulDiv(uint256(sqrtPriceX96) * uint256(sqrtPriceX96), 10 ** token.decimals, 1 << 192);
// ```
// And `USDC` has 6 decimals.
// The test says "getPrice() for USDC should be 1e6". It returns 1e6.
// What about other tokens? Let's check test outputs or other occurrences of getPrice.
