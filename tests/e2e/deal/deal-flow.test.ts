import { test, expect } from '@tests/e2e/setup'
import { accept, fund, markPaid, release, leaveFeedback } from './actions'
import { createOffer } from '../fixtures'

test.describe.serial('Deal flow', () => {
  test('maker is buying', async ({ createParty }) => {
    // Create Offer (Maker sells crypto, Taker buys crypto)
    const offerAddress = await createOffer({}, 0)
    const maker = await createParty()
    await maker.setAccount(0)

    // Open Deal
    const taker = await createParty(`/trade/offer/${offerAddress}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('0.00').first().fill('0.1')
    const openButton = taker.page.getByRole('button', { name: 'Initialize Deal' })
    await expect(openButton).toBeVisible()
    await openButton.click()

    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Deal progression
    await accept(maker)
    await expect(taker.page.getByText('Accepted', { exact: true })).toBeVisible()

    await fund(maker) // Maker is seller of crypto
    // Maker is seller, they should see "Waiting for payment"
    await expect(maker.page.getByText('Waiting for payment', { exact: false })).toBeVisible()
    // Taker is buyer, they should see "Confirm Payment Transmitted" button
    await expect(taker.page.getByRole('button', { name: 'Confirm Payment Transmitted' })).toBeVisible()
    await expect(taker.page.getByText('Waiting for payment', { exact: false })).not.toBeVisible()

    await markPaid(taker)
    await release(maker)

    // Feedback
    await leaveFeedback(taker, true, 'great')
    await leaveFeedback(maker, false, 'muhaha')
  })

  test('maker is selling', async ({ createParty }) => {
    // Create Sell Offer (Maker buys crypto, Taker sells crypto)
    const offerAddress = await createOffer({ isSell: true }, 0)
    const maker = await createParty()
    await maker.setAccount(0)

    // Open Deal
    const taker = await createParty(`/trade/offer/${offerAddress}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('0.00').first().fill('0.1')
    const openButton = taker.page.getByRole('button', { name: 'Initialize Deal' })
    await expect(openButton).toBeVisible()
    await openButton.click()

    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Deal progression - taker funds since they're selling crypto
    await accept(maker)
    await expect(taker.page.getByText('Accepted', { exact: true })).toBeVisible()

    await fund(taker)
    // Taker is seller, they should see "Waiting for payment"
    await expect(taker.page.getByText('Waiting for payment', { exact: false })).toBeVisible()
    // Maker is buyer, they should see "Confirm Payment Transmitted" button
    await expect(maker.page.getByRole('button', { name: 'Confirm Payment Transmitted' })).toBeVisible()
    await expect(maker.page.getByText('Waiting for payment', { exact: false })).not.toBeVisible()

    await markPaid(maker)
    await release(taker)

    // Feedback
    await leaveFeedback(taker, true, 'smooth')
    await leaveFeedback(maker, true, 'nice buyer')
  })
})
