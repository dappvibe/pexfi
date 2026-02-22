import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, getAddress, stringToHex, padHex } from 'viem'
import deploy from './deploy/deployMarket'

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
    // The contract owner is the deployer (walletClients[0])
    admin = getAddress(walletClients[0].account.address)
    nobody = getAddress(walletClients[3].account.address)
  })

  describe('Fiats CRUD', () => {
    test('addFiats() should add new fiat', async () => {
      const newFiat = { symbol: 'JPY', toUSD: USD.address }
      // addFiats(Fiats.Fiat[] calldata fiats_)
      await Market.write.addFiats([[newFiat]], { account: admin })

      const fiats = await Market.read.getFiats()
      const jpyBytes = padHex(stringToHex('JPY'), { size: 32, dir: 'right' })
      assert.ok(fiats.some(f => f === jpyBytes))

      const fiatInfo = await Market.read.fiat(['JPY'])
      assert.strictEqual(fiatInfo.symbol, 'JPY')
      assert.strictEqual(getAddress(fiatInfo.toUSD), getAddress(USD.address))
    })

    test('addFiats() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addFiats([[{ symbol: 'JPY', toUSD: USD.address }]], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })

    test('removeFiats() should remove fiat', async () => {
      await Market.write.removeFiats([['JPY']], { account: admin })

      const fiats = await Market.read.getFiats()
      const jpyBytes = padHex(stringToHex('JPY'), { size: 32, dir: 'right' })
      assert.ok(!fiats.some(f => f === jpyBytes))

      await viem.assertions.revertWithCustomError(
        Market.read.fiat(['JPY']),
        Market,
        'InvalidFiat'
      )
    })
  })

  describe('Tokens CRUD', () => {
    test('addTokens() should add new token', async () => {
      // addTokens(address[] calldata tokens_, uint16 uniswapPoolFee)
      await Market.write.addTokens([[WBTC.address], 3000], { account: admin })

      const tokens = await Market.read.getTokens()
      assert.ok(tokens.some(t => t.symbol === 'WBTC'))

      const tokenInfo = await Market.read.token(['WBTC'])
      assert.strictEqual(tokenInfo.symbol, 'WBTC')
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
      // removeTokens(string[] calldata token_)
      await Market.write.removeTokens([['WBTC']], { account: admin })

      const tokens = await Market.read.getTokens()
      assert.ok(!tokens.some(t => t.symbol === 'WBTC'))

      await viem.assertions.revertWithCustomError(
        Market.read.token(['WBTC']),
        Market,
        'InvalidToken'
      )
    })
  })

  describe('Methods CRUD', () => {
    test('addMethods() should add new method', async () => {
      const newMethod = { name: 'Alipay', group: 0 }
      // addMethods(Methods.Method[] calldata new_)
      await Market.write.addMethods([[newMethod]], { account: admin })

      const methods = await Market.read.getMethods()
      assert.ok(methods.some(m => m.name === 'Alipay'))

      const methodInfo = await Market.read.method(['Alipay'])
      assert.strictEqual(methodInfo.name, 'Alipay')
      assert.strictEqual(methodInfo.group, 0)
    })

    test('addMethods() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addMethods([[{ name: 'Alipay', group: 0 }]], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })

    test('removeMethods() should remove method', async () => {
      // removeMethods(string[] calldata names_)
      await Market.write.removeMethods([['Alipay']], { account: admin })

      const methods = await Market.read.getMethods()
      assert.ok(!methods.some(m => m.name === 'Alipay'))

      await viem.assertions.revertWithCustomError(
        Market.read.method(['Alipay']),
        Market,
        'InvalidMethod'
      )
    })
  })
})
