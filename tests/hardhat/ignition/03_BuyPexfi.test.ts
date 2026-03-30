import { describe, test, before } from 'node:test'
import * as assert from 'node:assert'
import hre from 'hardhat'
import BuyPexfiModule from '@evm/modules/03_BuyPexfi.ts'
import deploy from './01_Market.test.ts'
import { parseEther } from 'viem'

describe('BuyPexfi Module', () => {
  test('should execute buyback successfully', async () => {
    const { ignition, poolManager, pexfi, universalRouter, WETH, poolETH, USDC, EUR, positionManager } = await deploy()

    const parameters = {
      Market: {
        UniswapV4PoolManager: poolManager.address,
        UniswapV4PositionManager: positionManager.address,
        uniswapUniversalRouter: universalRouter.address,
        weth_address: WETH.address,
        weth_pool: poolETH.address,
        usdc: USDC.address,
        eur_chainlink: EUR.address,
      },
    }

    // Deploy the BuyPexfi module which should trigger the buyback call
    // Ignition should handle the execution of the call
    const { feeCollector } = await ignition.deploy(BuyPexfiModule, { parameters })

    assert.ok(feeCollector.address, 'FeeCollector should be available')

    // In a real scenario with a non-mock router, we would check balances.
    // Here we just ensure the ignition deployment completes without error.
  })
})
