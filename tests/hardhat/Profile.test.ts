import { before, describe, test } from 'node:test'
import * as assert from 'node:assert'
import { Address, getAddress, stringToHex } from 'viem'
import deploy from './deploy/deployMarket'

describe('Profile', () => {
  let Profile: any, viem: any, admin: Address, nobody: Address
  let user1: Address, user2: Address
  let tokenId1: bigint, tokenId2: bigint

  before(async () => {
    const deployment = await deploy()
    ;({
      Profile,
      viem,
    } = deployment)

    const walletClients = await viem.getWalletClients()
    admin = getAddress(walletClients[0].account.address)
    user1 = getAddress(walletClients[1].account.address)
    user2 = getAddress(walletClients[2].account.address)
    nobody = getAddress(walletClients[3].account.address)
  })

  describe('Registration', () => {
    test('register() should mint NFT and track ownership', async () => {
      await Profile.write.register({ account: user1 })
      tokenId1 = await Profile.read.ownerToTokenId([user1])
      assert.strictEqual(tokenId1, 1n)
      assert.strictEqual(getAddress(await Profile.read.ownerOf([tokenId1])), user1)

      await Profile.write.register({ account: user2 })
      tokenId2 = await Profile.read.ownerToTokenId([user2])
      assert.strictEqual(tokenId2, 2n)
    })

    test('register() should revert if already registered', async () => {
      await viem.assertions.revertWith(
        Profile.write.register({ account: user1 }),
        'already'
      )
    })
  })

  describe('Access Control', () => {
    const DEAL_ROLE = stringToHex('DEAL_ROLE', { size: 32 })
    const MARKET_ROLE = stringToHex('MARKET_ROLE', { size: 32 })

    test('should prevent unauthorized stat updates', async () => {
      await viem.assertions.revertWithCustomError(
        Profile.write.statsVote([tokenId1, true], { account: nobody }),
        Profile,
        'AccessControlUnauthorizedAccount'
      )
    })

    test('admin should be able to grant DEAL_ROLE via MARKET_ROLE', async () => {
      // 1. Grant MARKET_ROLE to admin (admin has DEFAULT_ADMIN_ROLE)
      await Profile.write.grantRole([MARKET_ROLE, admin], { account: admin })

      // 2. Grant DEAL_ROLE to admin (MARKET_ROLE is admin of DEAL_ROLE)
      await Profile.write.grantRole([DEAL_ROLE, admin], { account: admin })

      assert.ok(await Profile.read.hasRole([DEAL_ROLE, admin]))
    })
  })

  describe('Stat Updates', () => {
    test('statsVote() should increment upvotes', async () => {
      const statsBefore = await Profile.read.stats([tokenId1]) as any
      await Profile.write.statsVote([tokenId1, true], { account: admin })
      const statsAfter = await Profile.read.stats([tokenId1]) as any
      assert.strictEqual(Number(statsAfter.upvotes), Number(statsBefore.upvotes) + 1)
    })

    test('statsVolumeUSD() should accumulate volume', async () => {
      const statsBefore = await Profile.read.stats([tokenId1]) as any
      const volume = 1000n
      await Profile.write.statsVolumeUSD([tokenId1, volume], { account: admin })
      const statsAfter = await Profile.read.stats([tokenId1]) as any
      assert.strictEqual(BigInt(statsAfter.volumeUSD), BigInt(statsBefore.volumeUSD) + volume)
    })

    test('averaging logic (avgPaymentTime)', async () => {
      // First update: (0 + 100) / 2 = 50
      await Profile.write.statsAvgPaymentTime([tokenId1, 100], { account: admin })
      let stats = await Profile.read.stats([tokenId1]) as any
      assert.strictEqual(Number(stats.avgPaymentTime), 50)

      // Second update: (50 + 200) / 2 = 125
      await Profile.write.statsAvgPaymentTime([tokenId1, 200], { account: admin })
      stats = await Profile.read.stats([tokenId1]) as any
      assert.strictEqual(Number(stats.avgPaymentTime), 125)
    })
  })
})
