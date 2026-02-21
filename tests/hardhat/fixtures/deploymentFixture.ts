import hre from 'hardhat'
import MocksModule from '@evm/modules/00_MockDependencies.ts'
import MarketModule from '@evm/modules/01_Market.ts'

/**
 * Use hardhat loadFixture() to have a snaphot and reset state without re-deploying for each test.
 * Ensure the returned viem instance is used in tests so that nonce is preserved.
 *
 * @returns List of contracts as defined in ignition Market module
 */
export default async function deploymentFixture() {
  const { viem, ignition } = await hre.network.connect()

  // 1. Deploy Mocks state
  const mocks = await ignition.deploy(MocksModule)

  // 2. Prepare parameters to wire Market up to local mocks
  const parameters = {
    Market: {
      UniswapV3Factory: mocks.uniswap.address,
      uniswapUniversalRouter: mocks.uniswap.address, // reuse for mock
      weth: mocks.WETH.address,
      addTokens_0: [mocks.WBTC.address, mocks.WETH.address, mocks.USDC.address],
      addTokens_1: 500,
      fiats: [
        ['USD', mocks.USD.address],
        ['EUR', mocks.EUR.address],
        ['GBP', mocks.GBP.address],
      ],
      methods: [
        ['National Bank', 0n],
        ['SEPA', 0n],
      ],
    },
  }

  // 3. Deploy Market
  const market = await ignition.deploy(MarketModule, { parameters })
  return {
    ...mocks,
    ...market,
    viem
  }
}
