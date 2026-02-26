import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, getAddress, stringToHex, padHex } from 'viem'
import deploy from './deploy/deployMarket'
import { offerAbi } from '../../src/wagmi'

const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })
const bytes8 = (s: string) => padHex(stringToHex(s), { size: 8, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })
const bytes32 = (s: string) => padHex(stringToHex(s), { size: 32, dir: 'right' })

describe('Market', () => {
  let Market: any, WBTC: any, USD: any, USDC: any, viem: any, publicClient: any, networkHelpers: any, Offer: any
  let admin: Address, nobody: Address

  before(async () => {
    const deployment = await deploy()
    ;({
      Market,
      Offer,
      WBTC,
      USD,
      USDC,
      viem,
      publicClient,
      networkHelpers,
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
      assert.ok(fiats.some((f: any) => f === bytes3('JPY')))

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
      assert.ok(!fiats.some((f: any) => f === bytes3('JPY')))

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
      assert.ok(tokens.some((t: any) => t === bytes8('WBTC')))

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
      assert.ok(!tokens.some((t: any) => t === bytes8('WBTC')))

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
      assert.ok(methods.some((m: any) => m === bytes16('Alipay')))

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
      assert.ok(!methods.some((m: any) => m === bytes16('Alipay')))

      await viem.assertions.revertWithCustomError(
        Market.read.method([bytes16('Alipay')]),
        Market,
        'InvalidMethod'
      )
    })
  })

  describe('Offer Management', () => {
    const offerParams = {
      isSell: true,
      rate: 1000,
      limits: { min: 100, max: 1000 },
      token: bytes8('USDC'),
      fiat: bytes3('USD'),
      method: bytes16('National Bank'),
      terms: 'some terms'
    }

    test('createOffer() should create new offer', async () => {
      await Market.write.createOffer([offerParams], { account: admin })
      // The event emission is handled by OfferFactory/Market internal logic,
      // but we can check hasOffer for a newly created offer.
      // Since it uses Clones, we need to predict or find the address.
      // For simplicity, we just check that it doesn't revert and we can find it in events.
      const logs = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'OfferCreated'
      })
      assert.strictEqual(logs.length, 1)
      const offerAddress = logs[0].args.offer
      assert.ok(await Market.read.hasOffer([offerAddress]))
    })

    test('createOffer() should revert if rate is 0', async () => {
      const badParams = { ...offerParams, rate: 0 }
      await assert.rejects(
        Market.write.createOffer([badParams], { account: admin }),
        /rate/
      )
    })

    test('createOffer() should revert if min >= max', async () => {
      const badParams = { ...offerParams, limits: { min: 1000, max: 100 } }
      await viem.assertions.revertWithCustomError(
        Market.write.createOffer([badParams], { account: admin }),
        { abi: offerAbi },
        'InvalidLimits'
      )
    })
  })

  describe('Market Configuration', () => {
    test('setFee() should update fee', async () => {
      await Market.write.setFee([200], { account: admin })
      assert.strictEqual(await Market.read.fee(), 200)
      // reset back
      await Market.write.setFee([100], { account: admin })
    })

    test('setFee() should revert if not owner', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.setFee([200], { account: nobody }),
        Market,
        'OwnableUnauthorizedAccount'
      )
    })
  })

  describe('Pricing & Conversion', () => {
    test('getPrice() for USDC should be 1e6', async () => {
      const price = await Market.read.getPrice([bytes8('USDC'), bytes3('USD')])
      assert.strictEqual(price, 1000000n)
    })

    test('convert() should calculate correct amount', async () => {
      // USD to USDC (1:1 with 1000 rate/denominator)
      // convert(uint amount_, bytes3 fromFiat_, bytes8 toToken_, uint denominator)
      // If from == USD and to == USDC: amount_ * 1e4 / denominator
      // 100 USD * 1e4 / 10000 = 100 USDC (with 6 decimals = 100_000_000, wait USDC is 6 decimals)
      // Market.sol:135 returns FullMath.mulDiv(amount_, 10 ** 4, denominator);
      // amount_ is fiat amount (6 decimals), so 100 * 1e6 * 1e4 / 1e4 = 100 * 1e6 = 100 USDC. Correct.
      const amount = await Market.read.convert([100n * 10n ** 6n, bytes3('USD'), bytes8('USDC'), 10000n])
      assert.strictEqual(amount, 100n * 10n ** 6n)
    })
  })

  describe('Deal Interaction', () => {
    let testOffer: Address
    let testDeal: Address

    before(async () => {
      // Create an offer to use for deal tests
      const params = {
        isSell: true,
        rate: 10000,
        limits: { min: 1, max: 1000000 },
        token: bytes8('USDC'),
        fiat: bytes3('USD'),
        method: bytes16('SEPA'),
        terms: 'test'
      }
      await Market.write.createOffer([params], { account: admin })
      const logs = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'OfferCreated'
      })
      testOffer = logs[logs.length - 1].args.offer
    })

    test('addDeal() should revert if not called by offer', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.addDeal(['0x0000000000000000000000000000000000000001', 'terms', 'payment'], { account: admin }),
        Market,
        'UnauthorizedAccount'
      )
    })

    test('fundDeal() should revert if not called by deal', async () => {
      await viem.assertions.revertWithCustomError(
        Market.write.fundDeal({ account: admin }),
        Market,
        'UnauthorizedAccount'
      )
    })

    test('addDeal() should succeed when called by registered offer', async () => {
      // 1. Create a real deal via Offer.createDeal
      const OfferContract = await viem.getContractAt('Offer', testOffer)
      const createDealParams = {
        fiatAmount: 100n * 10n**6n,
        paymentInstructions: 'pay me'
      }
      const walletClients = await viem.getWalletClients()
      const takerAddress = getAddress(walletClients[1].account.address)

      await OfferContract.write.createDeal([Market.address, createDealParams], { account: takerAddress })

      const logs = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'DealCreated'
      })
      const dealAddress = logs[logs.length - 1].args.deal

      // 2. Impersonate the offer contract address
      await networkHelpers.impersonateAccount(testOffer)
      await networkHelpers.setBalance(testOffer, 10n**18n)

      // 3. Call addDeal with the REAL deal address
      // We can use a different terms/payment to verify it emits correctly
      await Market.write.addDeal([dealAddress, 'brand new terms', 'brand new payment'], { account: testOffer })

      const logsAfter = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'DealCreated'
      })
      assert.ok(logsAfter.some((l: any) => l.args.deal === dealAddress && l.args.terms === 'brand new terms'))

      await networkHelpers.stopImpersonatingAccount(testOffer)
    })

    test('fundDeal() should succeed when called by registered deal in Accepted state', async () => {
      // 1. Create a real deal via Offer.createDeal
      const OfferContract = await viem.getContractAt('Offer', testOffer)
      const createDealParams = {
        fiatAmount: 100n * 10n**6n, // 100 USD
        paymentInstructions: 'pay me'
      }

      const walletClients = await viem.getWalletClients()
      const takerAccount = walletClients[1] // Use taker from deployMarket
      const takerAddress = getAddress(takerAccount.account.address)

      await OfferContract.write.createDeal([Market.address, createDealParams], { account: takerAddress })

      const logs = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'DealCreated'
      })
      const dealAddress = logs[logs.length - 1].args.deal
      const DealContract = await viem.getContractAt('Deal', dealAddress)

      // 2. Transition deal to Accepted state
      // Deal.accept() is called by offer owner (admin in our setup)
      await DealContract.write.accept({ account: admin })
      assert.strictEqual(await DealContract.read.state(), 1) // 1 = Accepted

      // 3. Prepare seller for funding (seller is admin because isSell is true)
      // USDC is defined in deployMarket (it's mocks.USDC)
      const tokenAmount = await DealContract.read.tokenAmount()
      await USDC.write.approve([Market.address, tokenAmount], { account: admin })

      // 4. Impersonate deal and call fundDeal
      await networkHelpers.impersonateAccount(dealAddress)
      await networkHelpers.setBalance(dealAddress, 10n**18n)

      await Market.write.fundDeal({ account: dealAddress })

      // Verify deal balance changed (Market transferred from admin to deal)
      assert.strictEqual(await USDC.read.balanceOf([dealAddress]), tokenAmount)

      await networkHelpers.stopImpersonatingAccount(dealAddress)
    })
  })

  describe('View Functions', () => {
    test('token() should return token info', async () => {
      const info = await Market.read.token([bytes8('USDC')])
      assert.strictEqual(info.decimals, 6)
    })

    test('getTokens() should return list of tokens', async () => {
      const tokens = await Market.read.getTokens()
      assert.ok(tokens.length > 0)
    })

    test('fiat() should return oracle address', async () => {
      const oracleAddr = await Market.read.fiat([bytes3('USD')])
      assert.notStrictEqual(oracleAddr, '0x0000000000000000000000000000000000000000')
    })

    test('getFiats() should return list of fiats', async () => {
      const fiats = await Market.read.getFiats()
      assert.ok(fiats.length > 0)
    })

    test('method() should return method info', async () => {
      const info = await Market.read.method([bytes16('SEPA')])
      assert.ok(info.exists)
    })

    test('getMethods() should return list of methods', async () => {
      const methods = await Market.read.getMethods()
      assert.ok(methods.length > 0)
    })
  })
})
