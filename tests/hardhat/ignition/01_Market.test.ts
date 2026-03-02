import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import hre from 'hardhat'
import MocksModule from '@evm/modules/00_MockDependencies.ts'
import MarketModule from '@evm/modules/01_Market.ts'
import { getAddress, stringToHex, padHex, ethAddress } from 'viem'

/**
 * With HardHat v3 you must hre.network.connect() to have access to viem and network helpers such as takeSnapshot.
 * So this function creates a network and deploys the 'init' state of the blockchain.
 * Returned toolbox must be used in tests to preserve nonce and enable snapshots.
 * Think of it as a bootstrap entry point for each test suite using Market deployment.
 */
export default async function deploy() {
  const { viem, ignition, networkHelpers } = await hre.network.connect()

  // 1. Deploy Mocks state
  const mocks = await ignition.deploy(MocksModule)

  // 2. Prepare parameters to wire Market up to local mocks
  const parameters = {
    Market: {
      uniswapUniversalRouter: ethAddress, // mock is not implemented
      weth_address: mocks.WETH.address,
      weth_pool: mocks.poolETH.address,
      usdc: mocks.USDC.address,
      eur_chainlink: mocks.EUR.address,
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


/*
describe('market', () => {
  test('should deploy successfully', async () => {
    const { Market } = await deploy();
    assert.ok(Market.address, 'market contract should be deployed');
  })
})
*/
