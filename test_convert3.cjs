// 1 USDC = 0.925925 EUR
// If amount is 100 EUR, then amount in USDC should be 100 / 0.925925 = 108 USDC.
// Yes! 108000108n is ~ 108 USDC. So 100 EUR = 108 USDC.

// Let's check getPrice and decimals.
// getPrice returns price with 6 decimals.
// convert returns amount * 10**decimals / price.
// amount is in fiat, with 6 decimals.
// so amount * 10**decimals / price -> (fiat_amount * 10**6) * 10**decimals / (price_fiat * 10**6)
// The 10**6 in amount and 10**6 in price cancel out!
// We get fiat_amount * 10**decimals / price_fiat.
// This is perfectly correctly giving the precision of the target token.
// So why does the FIXME comment say "precision is not respected"?
// Let's read Market.sol again:
