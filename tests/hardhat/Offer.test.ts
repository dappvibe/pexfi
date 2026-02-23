import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { getAddress, padHex, parseEventLogs, stringToHex } from 'viem'
import deploy from './deploy/deployMarket'

const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })
const bytes8 = (s: string) => padHex(stringToHex(s), { size: 8, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })

export const OFFER_PARAMS = {
  isSell: true,
  token: bytes8('WBTC'),
  fiat: bytes3('USD'),
  method: bytes16('National Bank'),
  rate: 10250,
  limits: { min: 1000, max: 5000 },
  terms: 'terms of offer',
}

describe('Offer', () => {
  let viem, networkHelpers, Market, publicClient, walletClients

  before(async () => {
    ;({ viem, Market, networkHelpers } = await deploy())
    publicClient = await viem.getPublicClient()
    walletClients = await viem.getWalletClients()
  })

  describe('Market.createOffer', () => {
    describe('create()', () => {
      test('should trigger OfferCreated event', async () => {
        await viem.assertions.emit(Market.write.createOffer([OFFER_PARAMS]), Market, 'OfferCreated')
      })

      test('should register offer in Market', async () => {
        const hash = await Market.write.createOffer([OFFER_PARAMS])
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        const logs = parseEventLogs({
          abi: Market.abi,
          eventName: 'OfferCreated',
          logs: receipt.logs,
        })
        const offerAddress = logs[0].args.offer
        const hasOffer = await Market.read.hasOffer([offerAddress])
        assert.ok(hasOffer, 'Offer should be registered in Market')
      })

      test('should revert when limits max equals min', async () => {
        await viem.assertions.revertWith(
          Market.write.createOffer([
            {
              ...OFFER_PARAMS,
              limits: { min: 100, max: 100 },
            },
          ]),
          'minmax'
        )
      })

      test('should revert when limits max is less than min', async () => {
        await viem.assertions.revertWith(
          Market.write.createOffer([
            {
              ...OFFER_PARAMS,
              limits: { min: 101, max: 10 },
            },
          ]),
          'minmax'
        )
      })

      test('should revert when rate is zero', async () => {
        await viem.assertions.revertWith(
          Market.write.createOffer([
            {
              ...OFFER_PARAMS,
              rate: 0,
            },
          ]),
          'rate'
        )
      })

      test('should refuse when rate is negative', async () => {
        const promise = Market.write.createOffer([{ ...OFFER_PARAMS, rate: -1 }])
        await assert.rejects(promise, (error: any) => error.name === 'IntegerOutOfRangeError')
      })
    })
  })

  describe('Offer', () => {
    let offer

    before(async () => {
      const hash = await Market.write.createOffer([OFFER_PARAMS])
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const logs = parseEventLogs({
        abi: Market.abi,
        eventName: 'OfferCreated',
        logs: receipt.logs,
      })
      const offerAddress = logs[0].args.offer
      offer = await viem.getContractAt('Offer', offerAddress)
    })

    test('initialize: should revert if called twice', async () => {
      await viem.assertions.revertWithCustomError(
        offer.write.initialize([walletClients[0].account.address, OFFER_PARAMS]),
        offer,
        'InvalidInitialization'
      )
    })

    test('setRate: should update rate and emit OfferUpdated', async () => {
      const newRate = 11000
      await viem.assertions.emit(offer.write.setRate([newRate]), offer, 'OfferUpdated')
      const rate = await offer.read.rate()
      assert.strictEqual(rate, newRate)
    })

    test('setRate: should revert if not owner', async () => {
      const nonOwner = walletClients[1].account
      await viem.assertions.revertWithCustomErrorWithArgs(
        offer.write.setRate([12000], { account: nonOwner }),
        offer,
        'UnauthorizedAccount',
        [getAddress(nonOwner.address)]
      )
    })

    test('setLimits: should update limits and emit OfferUpdated', async () => {
      const newLimits = { min: 2000, max: 6000 }
      await viem.assertions.emit(offer.write.setLimits([newLimits]), offer, 'OfferUpdated')
      const limits = await offer.read.limits()
      assert.strictEqual(Number(limits[0]), newLimits.min)
      assert.strictEqual(Number(limits[1]), newLimits.max)
    })

    test('setLimits: should revert if min >= max', async () => {
      await viem.assertions.revertWith(offer.write.setLimits([{ min: 5000, max: 5000 }]), 'limits')
    })

    test('setTerms: should update terms and emit OfferUpdated', async () => {
      const newTerms = 'updated terms'
      await viem.assertions.emit(offer.write.setTerms([newTerms]), offer, 'OfferUpdated')
      const terms = await offer.read.terms()
      assert.strictEqual(terms, newTerms)
    })

    test('setDisabled: should update disabled and emit OfferUpdated', async () => {
      await viem.assertions.emit(offer.write.setDisabled([true]), offer, 'OfferUpdated')
      const disabled = await offer.read.disabled()
      assert.ok(disabled)
    })
  })
})
