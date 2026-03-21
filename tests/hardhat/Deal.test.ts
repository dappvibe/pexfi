import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, padHex, parseEventLogs, stringToHex } from 'viem'
import deploy from './ignition/01_Market.test'
import { profileAbi } from '../../src/wagmi'

const bytes32 = (s: string) => padHex(stringToHex(s), { size: 32, dir: 'right' })
const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })

describe('Deal', () => {
  let Market, WETH, feeCollector, OOv3, pexfiVesting
  let viem, networkHelpers, publicClient
  let maker: Address, taker: Address, nobody: Address
  let takeSnapshot
  let offerToSell, offerToBuy, offerParams
  let dealToBuy, dealToSell

  const FIAT_AMOUNT = 1000_000000n

  before(async () => {
    ;({
      Market,
      WETH,
      viem,
      networkHelpers,
      maker,
      taker,
      nobody,
      publicClient,
      feeCollector,
      OOv3,
      pexfiVesting,
    } = await deploy())
    ;({ takeSnapshot } = networkHelpers)

    offerParams = {
      isSell: true,
      token: WETH.address,
      fiat: bytes3('USD'),
      methods: 1n << 0n,
      rate: 10250,
      limits: { min: 1000, max: 5000 },
      terms: 'terms of offer',
    }

    //await publicClient.request({ method: 'hardhat_setLoggingEnabled', params: [true] })

    const createOffer = async (extraParams = {}) => {
      const hash = await Market.write.createOffer([{ ...offerParams, ...extraParams }])
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const logs = parseEventLogs({
        abi: Market.abi,
        eventName: 'OfferCreated',
        logs: receipt.logs,
      })
      assert.strictEqual(logs.length, 1)
      return await viem.getContractAt('Offer', logs[0].args.offer)
    }
    offerToSell = await createOffer({ isSell: true })
    offerToBuy = await createOffer({ isSell: false })
  })

  describe('Offer.createDeal', () => {
    test('createDeal() should revert if taker is offer owner', async () => {
      await viem.assertions.revertWithCustomErrorWithArgs(
        offerToSell.write.createDeal(
          [{ method: 0n, fiatAmount: FIAT_AMOUNT, paymentInstructions: 'instructions' }],
          { account: maker }
        ),
        offerToSell,
        'UnauthorizedAccount',
        [maker]
      )
      await viem.assertions.revertWithCustomErrorWithArgs(
        offerToBuy.write.createDeal(
          [{ method: 0n, fiatAmount: FIAT_AMOUNT, paymentInstructions: 'instructions' }],
          { account: maker }
        ),
        offerToBuy,
        'UnauthorizedAccount',
        [maker]
      )
    })

    test('createDeal() should trigger DealCreated event', async () => {
      const createFor = async (offer) => {
        const hash = await offer.write.createDeal(
          [{ fiatAmount: FIAT_AMOUNT, method: 0n, paymentInstructions: 'instructions' }],
          { account: taker }
        )
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        const logs = parseEventLogs({
          abi: Market.abi,
          eventName: 'DealCreated',
          logs: receipt.logs,
        })
        assert.strictEqual(logs.length, 1)
        return viem.getContractAt('Deal', logs[0].args.deal)
      }

      dealToBuy = await createFor(offerToSell)
      dealToSell = await createFor(offerToBuy)
    })
  })

  describe('Deal Canceled', () => {
    test('cancelled deal cannot be funded', async () => {
      const initiated = await takeSnapshot()
      await viem.assertions.emit(dealToBuy.write.cancel({ account: maker }), dealToBuy, 'DealState')
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.fund({ account: maker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await initiated.restore()
    })
  })

  describe('Deal Initiated', () => {
    test('members can message()', async () => {
      await viem.assertions.emitWithArgs(dealToBuy.write.message(['hello']), dealToBuy, 'Message', [maker, 'hello'])
    })

    test('maker can cancel', async () => {
      const snapshot = await takeSnapshot()
      await viem.assertions.emitWithArgs(dealToBuy.write.cancel({ account: maker }), dealToBuy, 'DealState', [5, maker])
      await viem.assertions.emitWithArgs(dealToSell.write.cancel({ account: maker }), dealToSell, 'DealState', [
        5,
        maker,
      ])
      await snapshot.restore()
    })

    test('taker cannot cancel before acceptance timeout', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.cancel({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.cancel({ account: taker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })

    test('taker can cancel after acceptance timeout', async () => {
      const snapshot = await takeSnapshot()
      await networkHelpers.time.increase(15 * 60 + 1)
      await viem.assertions.emitWithArgs(dealToBuy.write.cancel({ account: taker }), dealToBuy, 'DealState', [5, taker])
      await viem.assertions.emitWithArgs(dealToSell.write.cancel({ account: taker }), dealToSell, 'DealState', [
        5,
        taker,
      ])
      await snapshot.restore()
    })

    test('taker cannot accept', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.accept({ account: taker }),
        dealToBuy,
        'UnauthorizedAccount'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.accept({ account: taker }),
        dealToSell,
        'UnauthorizedAccount'
      )
    })

    test('nobody can dispute', async () => {
      await viem.assertions.revertWithCustomErrorWithArgs(
        dealToBuy.write.dispute({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState',
        [0]
      )
      await viem.assertions.revertWithCustomErrorWithArgs(
        dealToBuy.write.dispute({ account: maker }),
        dealToBuy,
        'ActionNotAllowedInThisState',
        [0]
      )
    })

    test('maker can accept', async () => {
      // do not take a snapshot here, advance state for next tests
      await viem.assertions.emitWithArgs(dealToBuy.write.accept({ account: maker }), dealToBuy, 'DealState', [1, maker])
      await viem.assertions.emitWithArgs(dealToSell.write.accept({ account: maker }), dealToSell, 'DealState', [
        1,
        maker,
      ])
    })

    test('cannot accept again', async () => {
      await viem.assertions.revertWithCustomErrorWithArgs(
        dealToBuy.write.accept({ account: maker }),
        dealToBuy,
        'ActionNotAllowedInThisState',
        [1]
      )
    })
  })

  describe('Deal Accepted', () => {
    test('buyer cannot fund()', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.fund({ account: taker }),
        dealToBuy,
        'UnauthorizedAccount'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.fund({ account: maker }),
        dealToSell,
        'UnauthorizedAccount'
      )
    })

    test('buyer cannot cancel', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.cancel({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.cancel({ account: maker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })

    test('buyer can cancel after timeout', async () => {
      const snapshot = await takeSnapshot()
      await networkHelpers.time.increase(60 * 60 + 1)
      await viem.assertions.emitWithArgs(dealToBuy.write.cancel({ account: taker }), dealToBuy, 'DealState', [5, taker])
      await viem.assertions.emitWithArgs(dealToSell.write.cancel({ account: maker }), dealToSell, 'DealState', [5, maker])
      await snapshot.restore()
    })

    test('fund() transfers token from seller to deal', async () => {
      // do not take a snapshot here, advance state for next tests
      const fund = async (deal, seller, amount) => {
        await WETH.write.approve([Market.address, amount], { account: seller })
        const tx = await deal.write.fund({ account: seller })
        await viem.assertions.emitWithArgs(tx, deal, 'DealState', [2, seller])
        await viem.assertions.emitWithArgs(tx, WETH, 'Transfer', [seller, deal.address, amount])
        return tx
      }
      const amount = await dealToBuy.read.tokenAmount()
      await fund(dealToBuy, maker, amount)
      await fund(dealToSell, taker, amount)
    })

    test('cannot fund() again', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.fund({ account: maker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.fund({ account: taker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })
  })

  describe('Deal Funded', () => {
    test('buyer cannot cancel', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.cancel({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.cancel({ account: maker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })

    test('seller cannot call paid()', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.paid({ account: maker }),
        dealToBuy,
        'UnauthorizedAccount'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.paid({ account: taker }),
        dealToSell,
        'UnauthorizedAccount'
      )
    })

    test('paid() moves to Paid state', async () => {
      // do not take a snapshot here, advance state for next tests
      await viem.assertions.emitWithArgs(dealToBuy.write.paid({ account: taker }), dealToBuy, 'DealState', [3, taker])
      await viem.assertions.emitWithArgs(dealToSell.write.paid({ account: maker }), dealToSell, 'DealState', [3, maker])
    })
  })

  describe('Deal Disputed', () => {
    let disputed, undisputed // to revert once when this block is done

    test('buyer cannot cancel', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.cancel({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.cancel({ account: maker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })

    test('anyone can dispute()', async () => {
      undisputed = await takeSnapshot()
      await viem.assertions.emitWithArgs(dealToBuy.write.dispute({ account: taker }), dealToBuy, 'DealState', [
        4,
        taker,
      ])
      await viem.assertions.emitWithArgs(dealToSell.write.dispute({ account: maker }), dealToSell, 'DealState', [
        4,
        maker,
      ])
      disputed = await takeSnapshot()
    })

    test('arbiter resolves PAID', async () => {
      // deployer (default account) ask Vesting wallet to bond for resolution
      const hash = await pexfiVesting.write.bond([dealToBuy.address, stringToHex('PAID')], { account: maker })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const assertionId = parseEventLogs({
        abi: OOv3.abi,
        eventName: 'AssertionMade',
        logs: receipt.logs,
      })[0].args.assertionId
      assert.ok(assertionId)

      await viem.assertions.revertWith(OOv3.write.settleAssertion([assertionId]), 'Assertion not expired')

      // Revert if called by not oracle
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.assertionResolvedCallback([assertionId, true]),
        Market,
        'UnauthorizedAccount'
      )

      await networkHelpers.time.increase(61) // default liveness

      await viem.assertions.emitWithArgs(OOv3.write.settleAssertion([assertionId]), dealToBuy, 'DealState', [
        6,
        OOv3.address,
      ])
      assert.ok(await dealToBuy.read.resolvedPaid())
    })

    test('anyone can release() if Resolved and resolvedPaid', async () => {
      await viem.assertions.emit(dealToBuy.write.release({ account: nobody }), dealToBuy, 'DealState')
      await disputed.restore()
    })

    test('release() fails if Resolved and NOT resolvedPaid', async () => {
       // 1. Resolve NOT PAID
       const hash = await pexfiVesting.write.bond([dealToBuy.address, stringToHex('NOT PAID')], { account: maker })
       const receipt = await publicClient.waitForTransactionReceipt({ hash })
       const assertionId = parseEventLogs({
         abi: OOv3.abi,
         eventName: 'AssertionMade',
         logs: receipt.logs,
       })[0].args.assertionId
       await networkHelpers.time.increase(61)
       await OOv3.write.settleAssertion([assertionId])
       assert.ok(!(await dealToBuy.read.resolvedPaid()))

       // 2. Try release
       await viem.assertions.revertWithCustomError(dealToBuy.write.release({ account: nobody }), dealToBuy, 'InvalidResolution')

       await disputed.restore()
    })

    test('arbiter resolves NOT PAID', async () => {
      // deployer (default account) ask Vesting wallet to bond for resolution
      const hash = await pexfiVesting.write.bond([dealToBuy.address, stringToHex('NOT PAID')], { account: maker })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const assertionId = parseEventLogs({
        abi: OOv3.abi,
        eventName: 'AssertionMade',
        logs: receipt.logs,
      })[0].args.assertionId
      assert.ok(assertionId)

      await viem.assertions.revertWith(OOv3.write.settleAssertion([assertionId]), 'Assertion not expired')
      await networkHelpers.time.increase(61) // default liveness

      await viem.assertions.emitWithArgs(OOv3.write.settleAssertion([assertionId]), dealToBuy, 'DealState', [
        6,
        OOv3.address,
      ])
    })

    test('anyone can cancel()', async () => {
      await viem.assertions.emit(dealToBuy.write.cancel({ account: nobody }), dealToBuy, 'DealState')
      await undisputed.restore()
    })
  })

  describe('Deal Paid', () => {
    test('buyer cannot release()', async () => {
      await viem.assertions.revertWithCustomError(dealToBuy.write.release({ account: taker }), Market, 'UnauthorizedAccount')
      await viem.assertions.revertWithCustomError(dealToSell.write.release({ account: maker }), Market, 'UnauthorizedAccount')
    })

    test('release() should transfer tokens to buyer and collect fee', async () => {
      // do not take a snapshot here, advance state for next tests
      const release = async (deal, seller, buyer) => {
        const amount = await deal.read.tokenAmount()
        const fee = BigInt(await Market.read.fee())
        const feeAmount = (amount * fee) / 10000n

        const tx = await deal.write.release({ account: seller })

        await viem.assertions.emitWithArgs(tx, deal, 'DealState', [7, seller])
        await viem.assertions.emitWithArgs(tx, WETH, 'Transfer', [deal.address, buyer, BigInt(amount - feeAmount)])
        if (fee > 0) {
          await viem.assertions.emitWithArgs(tx, WETH, 'Transfer', [deal.address, feeCollector.address, feeAmount])
        }
      }

      await release(dealToBuy, maker, taker)
      await release(dealToSell, taker, maker)
    })

    test('cannot release() again', async () => {
      await viem.assertions.revertWithCustomError(
        dealToBuy.write.release({ account: taker }),
        dealToBuy,
        'ActionNotAllowedInThisState'
      )
      await viem.assertions.revertWithCustomError(
        dealToSell.write.release({ account: maker }),
        dealToSell,
        'ActionNotAllowedInThisState'
      )
    })
  })

  describe('Deal Released', () => {
    test('Feedback emits event', async () => {
      await viem.assertions.emit(
        dealToBuy.write.feedback([true, 'good deal'], { account: taker }),
        dealToBuy,
        'FeedbackGiven'
      )
      await viem.assertions.emit(
        dealToBuy.write.feedback([true, 'good deal'], { account: maker }),
        dealToBuy,
        'FeedbackGiven'
      )
    })

    test('Feedback can be given again but subgraph handles it', async () => {
      await viem.assertions.emit(
        dealToBuy.write.feedback([true, 'good deal'], { account: taker }),
        dealToBuy,
        'FeedbackGiven'
      )
      await viem.assertions.emit(
        dealToBuy.write.feedback([true, 'good deal'], { account: maker }),
        dealToBuy,
        'FeedbackGiven'
      )
    })

    test('Feedback reverts if in wrong state (e.g. Paid)', async () => {
       // Create a new deal, advance to Paid
       const hash = await offerToSell.write.createDeal([
         { fiatAmount: FIAT_AMOUNT, method: 0n, paymentInstructions: 'i' }
       ], { account: taker })
       const r = await publicClient.waitForTransactionReceipt({ hash })
       const dealAddr = parseEventLogs({ abi: Market.abi, eventName: 'DealCreated', logs: r.logs })[0].args.deal
       const deal = await viem.getContractAt('Deal', dealAddr)

       await deal.write.accept({ account: maker })
       await WETH.write.approve([Market.address, await deal.read.tokenAmount()], { account: maker })
       await deal.write.fund({ account: maker })
       await deal.write.paid({ account: taker })

       await viem.assertions.revertWithCustomError(
         deal.write.feedback([true, 'fail'], { account: taker }),
         deal,
         'ActionNotAllowedInThisState'
       )
    })

    test('supportsInterface() returns true for OOv3 recipient', async () => {
       // OptimisticOracleV3CallbackRecipientInterface:
       // assertionResolvedCallback(bytes32,bool) -> 0xf1b156b2
       // assertionDisputedCallback(bytes32)      -> 0xd448a4ec
       // XOR: 0xf1b156b2 ^ 0xd448a4ec = 0x25f9f25e
       const OOv3_RECIPIENT_INTERFACE_ID = '0x25f9f25e'
       assert.ok(await dealToBuy.read.supportsInterface([OOv3_RECIPIENT_INTERFACE_ID]))
    })

    test('message() reverts if not member', async () => {
       await viem.assertions.revertWithCustomError(
         dealToBuy.write.message(['hello'], { account: nobody }),
         dealToBuy,
         'UnauthorizedAccount'
       )
    })
  })
})
