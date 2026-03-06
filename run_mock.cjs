const { assert } = require('console');
// WETH / USDC
// tickDelta = - 17595346759502 - (- 17595288323282)
let tickCumulatives1 = -17595346759502n;
let tickCumulatives0 = -17595288323282n;
let tickDelta = tickCumulatives1 - tickCumulatives0;
// tickDelta / 300
let tick = Number(tickDelta) / 300;
console.log("Tick:", tick);
let price_ratio = Math.pow(1.0001, tick);
console.log("Price Ratio (token1/token0):", price_ratio);

// If tick = -194, ratio = 1.0001^-194 = 0.98. Wait. -194?
// Let's re-calculate.
console.log("tickDelta:", tickDelta);
console.log("tick:", tickDelta / 300n);
// -194787
let price_ratio2 = Math.pow(1.0001, Number(tickDelta) / 300);
console.log("Price Ratio:", price_ratio2);
