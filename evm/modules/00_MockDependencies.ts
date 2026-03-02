import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

/**
 * Marketplace depends on external services such as:
 *  1. Uniswap - to read current tokens prices from v3 pools.
 *  2. Chainlink - to read fiat currency rates in relation to USD so that we can find price for WBTC/EUR and alike.
 *
 * These service addresses are passed as arguments files to ignition deployment.
 * In local dev environment you should run this module and build parameters json file with deployed addresses.
 */

// Initial chainlink mocks values
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.26,
}

export default buildModule('Mocks', (m) => {
  // --- 1. Tokens ---
  const tokens: Record<string, any> = {}
  const tokenList = [
    ['WBTC', 8],
    ['WETH', 18],
    ['USDC', 6],
  ] as const

  // Contract credits Deployer. They will transfer to the first 5 accounts.
  const accounts = []
  for (let i = 1; i <= 5; i++) {
    accounts.push(m.getAccount(i))
  }

  for (const [symbol, decimals] of tokenList) {
    const token = m.contract('MockERC20', [symbol, decimals], { id: symbol })
    tokens[symbol] = token

    const amount = 100000n * 10n ** BigInt(decimals)

    for (let i = 0; i < accounts.length; i++) {
      m.call(token, 'transfer', [accounts[i], amount], {
        id: `transfer_${symbol}_${i}`,
      })
    }
  }

  // --- 2. Uniswap ---
  const poolBTC = m.contract('PoolBTC', [], { id: 'PoolBTC' })
  const poolETH = m.contract('PoolETH', [], { id: 'PoolETH' })

  // --- 3. Price Feeds ---
  const priceFeeds: Record<string, any> = {}

  for (const [code, rate] of Object.entries(RATES)) {
    const feed = m.contract('PriceFeed', [code], { id: `PriceFeed_${code}` })
    priceFeeds[code] = feed

    const intRate = Math.round(rate * 10 ** 8)
    m.call(feed, 'set', [intRate], { id: `SetRate_${code}` })
  }

  // Return everything needed for Market
  return {
    ...tokens,
    ...priceFeeds,
    poolBTC,
    poolETH
  }
})
