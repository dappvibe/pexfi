import hre from 'hardhat'
import MocksModule from '@evm/modules/00_MockDependencies.ts'
import MarketModule from '@evm/modules/01_Market.ts'
import { getAddress, stringToHex, padHex } from 'viem'

const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })

/**
 * With HardHat v3 you must hre.network.connect() to have access to viem and network helpers such as takeSnapshot.
 * So this function creates a network and deploys the 'init' state of the blockchain.
 * Returned toolbox must be used in tests to preserve nonce and enable snapshots.
 * Think of it as a bootstrap entry point for each test suite using Market deployment.
 */
export default async () => {
  const { viem, ignition, networkHelpers } = await hre.network.connect()
`
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
        [bytes3('USD'), mocks.USD.address],
        [bytes3('EUR'), mocks.EUR.address],
        [bytes3('GBP'), mocks.GBP.address],
      ],
      methodNames: [bytes16('National Bank'), bytes16('SEPA')],
      methodGroups: [0n, 0n],
    },
  }

  // 3. Deploy Market
  const market = await ignition.deploy(MarketModule, { parameters })

  // 4. Normalize address cases to match EVM internals so that the client matches events, errors.
  const publicClient = await viem.getPublicClient()
  const walletClients = await viem.getWalletClients()
  const maker = getAddress(walletClients[0].account.address)
  const taker = getAddress(walletClients[1].account.address)
  const nobody = getAddress(walletClients[3].account.address)
  const admin = getAddress(walletClients[2].account.address)

  return {
    ...mocks,
    ...market,
    maker, taker, admin, nobody,
    publicClient, walletClients,
    viem,
    ignition,
    networkHelpers
  }
}
