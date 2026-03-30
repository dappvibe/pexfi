import { describe, test } from 'node:test'
import * as assert from 'node:assert'
import BuyPexfiModule from '@evm/modules/03_BuyPexfi.ts'
import deploy from './01_Market.test.ts'

describe('BuyPexfi Module', () => {
  test('should execute buyback successfully', async () => {
    const { ignition, universalRouter, pexfi } = await deploy()

    const parameters = {
      BuyPexfi: {
        pexfi_address: pexfi.address,
        uniswapUniversalRouter: universalRouter.address,
      },
    }

    // Deploy and run the BuyPexfi module
    const { action } = await ignition.deploy(BuyPexfiModule, { parameters })

    assert.ok(action.address, 'PexfiBuybackAction should be deployed')
  })
})
