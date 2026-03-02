import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { getAddress, zeroAddress, type Address } from 'viem'
import hre from 'hardhat'

describe('FeeCollector', () => {
  let viem: any
  let walletClients: any[]
  let pexfi: any
  let universalRouter: any
  let mockRouter: Address
  let mockWeth: Address

  const POOL_FEE = 3000
  const TICK_SPACING = 60

  const validPoolKey = (pexfiAddr: Address) => ({
    currency0: zeroAddress,
    currency1: pexfiAddr,
    fee: POOL_FEE,
    tickSpacing: TICK_SPACING,
    hooks: zeroAddress,
  })

  before(async () => {
    ;({ viem } = await hre.network.connect())
    walletClients = await viem.getWalletClients()
    universalRouter = await viem.deployContract('UniswapUniversalRouterMock', [])
    mockRouter = getAddress(universalRouter.address)
    mockWeth = getAddress(walletClients[5].account.address)
    pexfi = await viem.deployContract('MockERC20', ['PEXFI', 18])
  })

  describe('constructor', () => {
    test('should reject zero vault address', async () => {
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          zeroAddress, pexfi.address, mockRouter, mockWeth,
          validPoolKey(pexfi.address),
        ]),
      )
    })

    test('should reject zero pexfi address', async () => {
      const vault = walletClients[6].account.address
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          vault, zeroAddress, mockRouter, mockWeth,
          validPoolKey(zeroAddress),
        ]),
      )
    })

    test('should reject zero universalRouter address', async () => {
      const vault = walletClients[6].account.address
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          vault, pexfi.address, zeroAddress, mockWeth,
          validPoolKey(pexfi.address),
        ]),
      )
    })

    test('should reject zero weth address', async () => {
      const vault = walletClients[6].account.address
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          vault, pexfi.address, mockRouter, zeroAddress,
          validPoolKey(pexfi.address),
        ]),
      )
    })

    test('should reject pool key not involving PEXFI', async () => {
      const vault = walletClients[6].account.address
      const badKey = {
        currency0: zeroAddress,
        currency1: walletClients[7].account.address, // not PEXFI
        fee: POOL_FEE,
        tickSpacing: TICK_SPACING,
        hooks: zeroAddress,
      }
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          vault, pexfi.address, mockRouter, mockWeth, badKey,
        ]),
      )
    })

    test('should reject pool key not involving ETH', async () => {
      const vault = walletClients[6].account.address
      const badKey = {
        currency0: pexfi.address,
        currency1: walletClients[7].account.address,
        fee: POOL_FEE,
        tickSpacing: TICK_SPACING,
        hooks: zeroAddress,
      }
      await assert.rejects(
        viem.deployContract('FeeCollector', [
          vault, pexfi.address, mockRouter, mockWeth, badKey,
        ]),
      )
    })
  })

  describe('immutables', () => {
    let feeCollector: any
    let vaultAddr: Address

    before(async () => {
      vaultAddr = getAddress(walletClients[6].account.address)
      feeCollector = await viem.deployContract('FeeCollector', [
        vaultAddr, pexfi.address, mockRouter, mockWeth,
        validPoolKey(pexfi.address),
      ])
    })

    test('vault()', async () => {
      assert.strictEqual(getAddress(await feeCollector.read.vault()), vaultAddr)
    })

    test('pexfi()', async () => {
      assert.strictEqual(getAddress(await feeCollector.read.pexfi()), getAddress(pexfi.address))
    })

    test('universalRouter()', async () => {
      assert.strictEqual(getAddress(await feeCollector.read.universalRouter()), mockRouter)
    })

    test('weth()', async () => {
      assert.strictEqual(getAddress(await feeCollector.read.weth()), mockWeth)
    })

    test('pexfiPoolKey() returns correct struct', async () => {
      const key = await feeCollector.read.pexfiPoolKey()
      assert.strictEqual(getAddress(key.currency0), zeroAddress)
      assert.strictEqual(getAddress(key.currency1), getAddress(pexfi.address))
      assert.strictEqual(key.fee, POOL_FEE)
      assert.strictEqual(key.tickSpacing, TICK_SPACING)
      assert.strictEqual(getAddress(key.hooks), zeroAddress)
    })
  })

  describe('buyback', () => {
    let feeCollector: any
    let vaultAddr: Address

    before(async () => {
      vaultAddr = getAddress(walletClients[6].account.address)
      feeCollector = await viem.deployContract('FeeCollector', [
        vaultAddr, pexfi.address, mockRouter, mockWeth,
        validPoolKey(pexfi.address),
      ])
    })

    test('should forward PEXFI balance directly to vault', async () => {
      const amount = 1000n * 10n ** 18n
      await pexfi.write.transfer([feeCollector.address, amount])

      const vaultBefore = await pexfi.read.balanceOf([vaultAddr])
      await feeCollector.write.buyback([pexfi.address, 0])
      const vaultAfter = await pexfi.read.balanceOf([vaultAddr])

      assert.strictEqual(vaultAfter - vaultBefore, amount)

      const remaining = await pexfi.read.balanceOf([feeCollector.address])
      assert.strictEqual(remaining, 0n)
    })

    test('should be no-op when PEXFI balance is zero', async () => {
      const vaultBefore = await pexfi.read.balanceOf([vaultAddr])
      await feeCollector.write.buyback([pexfi.address, 0])
      const vaultAfter = await pexfi.read.balanceOf([vaultAddr])
      assert.strictEqual(vaultAfter, vaultBefore)
    })

    test('should call universalRouter for other tokens', async () => {
      const otherToken = await viem.deployContract('MockERC20', ['TEST', 18])
      const amount = 1000n * 10n ** 18n
      await otherToken.write.transfer([feeCollector.address, amount])

      // Should not revert.
      // Since it's a simple mock, the balance of otherToken won't decrease
      // unless we make the mock pull it.
      await feeCollector.write.buyback([otherToken.address, 3000])

      // Verify it called something (the test passes if it doesn't revert)
      // For more rigor we could track events or mock the router's internal state.
    })

    test('should call universalRouter for Native ETH', async () => {
      // Send some ETH to feeCollector
      const amount = 10n ** 18n
      await walletClients[0].sendTransaction({
        to: feeCollector.address,
        value: amount,
      })

      // Should not revert.
      await feeCollector.write.buyback([zeroAddress, 3000])
    })
  })
})
