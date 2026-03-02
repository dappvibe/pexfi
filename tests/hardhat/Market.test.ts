import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, getAddress, stringToHex, padHex, zeroAddress, ethAddress } from 'viem'
import deploy from './ignition/01_Market.test'
import { offerAbi } from '../../src/wagmi'

const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })

describe('Market', () => {
  let Market, WETH, EUR, USDC, viem, publicClient, networkHelpers
  let admin: Address, nobody: Address
  let offerParams

  before(async () => {
    const deployment = await deploy()
    ;({
      Market,
      WETH,
      EUR,
      USDC,
      viem,
      publicClient,
      networkHelpers,
      admin,
    } = deployment)

    const walletClients = await viem.getWalletClients()
    admin = getAddress(walletClients[0].account.address)
    nobody = getAddress(walletClients[3].account.address)

    offerParams = {
      isSell: true,
      rate: 1000,
      limits: { min: 100, max: 1000 },
      token: WETH.address,
      fiat: bytes3('USD'),
      methods: 1n << 0n,
      terms: 'some terms',
    }
  })

  describe('Fiats CRUD', () => {
    test('addFiat() should add new fiat', async () => {
      const newFiat = [bytes3('JPY'), EUR.address]
      await Market.write.addFiat(newFiat, { account: admin })

      const fiats = await Market.read.fiats([bytes3('JPY')])
      assert.ok(fiats)

      const feed = await Market.read.fiats([bytes3('JPY')])
      assert.strictEqual(getAddress(feed), getAddress(EUR.address))
    })

    test('removeFiats() should remove fiat', async () => {
      await viem.assertions.emit(
        Market.write.removeFiat([bytes3('JPY')], { account: admin }),
        Market,
        'FiatRemoved'
      )

      const res = await Market.read.fiats([bytes3('JPY')])
      assert.strictEqual(res, zeroAddress)
    })
  })

  describe('Tokens CRUD', () => {
    test('removeToken() should remove token', async () => {
      const s = await networkHelpers.takeSnapshot();
      await Market.write.removeToken([WETH.address], { account: admin })

      const info = await Market.read.tokens([WETH.address])
      assert.strictEqual(info[0], zeroAddress)

      await s.restore();
    })
  })

  describe('Methods CRUD', () => {
    test('addMethods() should add new method', async () => {
      await viem.assertions.emitWithArgs(
        Market.write.addMethods([[bytes16('Alipay')]]),
        Market,
        'MethodAdded',
        [bytes16('Alipay'), 1n]
      )

      const methods = await Market.read.methods([1])
      assert.strictEqual(methods, bytes16('Alipay'))
    })

    test('disableMethods() should update mask', async () => {
      await viem.assertions.emitWithArgs(
        Market.write.disableMethods([1]),
        Market,
        'MethodsDisabledMask',
        [1n]
      )
    })

    test('enableMethods() should update mask', async () => {
      await viem.assertions.emitWithArgs(Market.write.enableMethods([1]), Market, 'MethodsDisabledMask', [0n])
    })

    test('unknown method should revert with panic', async () => {
      await viem.assertions.revert(Market.read.methods([100]));
    })
  })

  describe('Offer Management', () => {
    test('createOffer() should create new offer', async () => {
      await Market.write.createOffer([offerParams])
      const logs = await publicClient.getContractEvents({
        address: Market.address,
        abi: Market.abi,
        eventName: 'OfferCreated'
      })
      assert.strictEqual(logs.length, 1)
      const offerAddress = logs[0].args.offer

      const offer = await Market.read.offers([offerAddress]);
      assert.ok(offer)
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
      const price = await Market.read.getPrice([USDC.address, bytes3('USD')])
      assert.strictEqual(price, 1000000n)
    })

    test('convert() should calculate correct amount', async () => {
      const amount = await Market.read.convert([100n * 10n ** 6n, bytes3('USD'), USDC.address, 10000n])
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
        token: USDC.address,
        fiat: bytes3('USD'),
        methods: 1n << 1n,
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
        Market.write.addDeal(['0x0000000000000000000000000000000000000001', bytes16('Bank Transfer'), 'terms', 'payment'], { account: admin }),
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
        method: 1n,
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
      await Market.write.addDeal([dealAddress, bytes16('Bank Transfer'), 'brand new terms', 'brand new payment'], { account: testOffer })

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
        method: 1n,
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
    test('tokens() should return token info', async () => {
      const info = await Market.read.tokens([USDC.address])
      assert.strictEqual(info[0], getAddress(ethAddress))
      assert.strictEqual(info[1], 6)
    })

    test('fiats() should return oracle address', async () => {
      const oracleAddr = await Market.read.fiats([bytes3('USD')])
      assert.strictEqual(oracleAddr, getAddress(ethAddress))
    })
  })
})
