let price = 1000000n * 10n**8n / 108000000n; // getPrice(USDC, EUR)
console.log("getPrice(USDC, EUR)", price);
// EUR to USDC
// amount_ is 100 EUR = 100 * 10**6
let amount_ = 100n * 10n**6n;
let decimals = 6n;
let a = amount_ * (10n**decimals) / price;
console.log("EUR to USDC", a);
// 100 EUR / 1.08 = 92.59 USDC. Wait.
// getPrice(USDC, EUR) -> 1 * 10**6 (price of USDC in USDC)
// fiat_ = EUR
// getPrice(USDC, EUR) -> price * 10**8 / fiatToUSD -> 1 * 10**6 * 10**8 / (1.08 * 10**8) = 1 * 10**6 / 1.08 = 925925 (this is price of 1 USDC in EUR!)
