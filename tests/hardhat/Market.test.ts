import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, getAddress, stringToHex, padHex } from 'viem'
import deploy from './deploy/deployMarket'

const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })
const bytes8 = (s: string) => padHex(stringToHex(s), { size: 8, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })

describe('Market', () => {
  let Market, WBTC, USD, viem
  let admin: Address, nobody: Address

  before(async () => {
    const deployment = await deploy()
    ;({
      Market,
      WBTC,
      USD,
      viem,
      admin,
    } = deployment)

    const walletClients = await viem.getWalletClients()
    admin = getAddress(walletClients[0].account.address)
    nobody = getAddress(walletClients[3].account.address)
  })

  describe('Fiats CRUD', () => {
    test('addFiats() should add new fiat', async () => {
      const newFiat = { symbol: bytes3('JPY'), toUSD: USD.address }
      await Market.write.addFiats([[newFiat]], { account: admin })

      const fiats = await Market.read.getFiats()
      assert.ok(fiats.some(f => f === bytes3('JPY')))

      const feed = await Market.read.fiat([bytes3('JPY')])
      assert.strictEqual(getAddress(feed), getAddress(USD.address))
    })

    test('addFiats() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addFiats([[{ symbol: bytes3('JPY'), toUSD: USD.address }]], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })

    test('removeFiats() should remove fiat', async () => {
      await Market.write.removeFiats([[bytes3('JPY')]], { account: admin })

      const fiats = await Market.read.getFiats()
      assert.ok(!fiats.some(f => f === bytes3('JPY')))

      await viem.assertions.revertWithCustomError(
        Market.read.fiat([bytes3('JPY')]),
        Market,
        'InvalidFiat'
      )
    })
  })

  describe('Tokens CRUD', () => {
    test('addTokens() should add new token', async () => {
      await Market.write.addTokens([[WBTC.address], 3000], { account: admin })

      const tokens = await Market.read.getTokens()
      assert.ok(tokens.some(t => t === bytes8('WBTC')))

      const tokenInfo = await Market.read.token([bytes8('WBTC')])
      assert.strictEqual(getAddress(tokenInfo.api), getAddress(WBTC.address))
      assert.strictEqual(tokenInfo.uniswapPoolFee, 3000)
    })

    test('addTokens() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addTokens([[WBTC.address], 3000], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })

    test('removeTokens() should remove token', async () => {
      await Market.write.removeTokens([[bytes8('WBTC')]], { account: admin })

      const tokens = await Market.read.getTokens()
      assert.ok(!tokens.some(t => t === bytes8('WBTC')))

      await viem.assertions.revertWithCustomError(
        Market.read.token([bytes8('WBTC')]),
        Market,
        'InvalidToken'
      )
    })
  })

  describe('Methods CRUD', () => {
    test('addMethods() should add new method', async () => {
      await Market.write.addMethods([[bytes16('Alipay')], [0]], { account: admin })

      const methods = await Market.read.getMethods()
      assert.ok(methods.some(m => m === bytes16('Alipay')))

      const methodInfo = await Market.read.method([bytes16('Alipay')])
      assert.ok(methodInfo.exists)
      assert.strictEqual(methodInfo.group, 0)
    })

    test('addMethods() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addMethods([[bytes16('Alipay')], [0]], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })

    test('removeMethods() should remove method', async () => {
      await Market.write.removeMethods([[bytes16('Alipay')]], { account: admin })

      const methods = await Market.read.getMethods()
      assert.ok(!methods.some(m => m === bytes16('Alipay')))

      await viem.assertions.revertWithCustomError(
        Market.read.method([bytes16('Alipay')]),
        Market,
        'InvalidMethod'
      )
    })
  })
})
