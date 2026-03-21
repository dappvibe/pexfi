import { test, expect } from '@tests/e2e/setup'
import { createOffer, createDeal } from '@tests/e2e/fixtures'

test.describe('Profile Deals', () => {
  test('should display new deals in profile', async ({ createParty }) => {
    // 1. Setup Maker and Taker
    const maker = await createParty()
    await maker.setAccount(0)

    const taker = await createParty()
    await taker.setAccount(1)

    // 2. Create Offer and Deal via fixtures (fast)
    // Maker is selling USDC (default token in fixtures)
    const offerAddress = await createOffer({ isSell: true }, 0)
    await createDeal(offerAddress, { fiatAmount: 15 }, 1)

    // 3. Check "Initiated" deal in profile (UserDealsPage) for both
    // Maker profile deals
    await maker.page.goto('/#/me/deals')
    await expect(maker.page.getByText('Initiated').first()).toBeVisible({ timeout: 15000 })
    // In fixtures, default token is USDC and fiat is EUR, amount is 15, method is 0 (Bank Transfer)
    await expect(maker.page.getByText(/Sell .* USDC/).first()).toBeVisible()
    await expect(maker.page.getByText(/15 EUR/).first()).toBeVisible()
    await expect(maker.page.getByText(/Bank Transfer/).first()).toBeVisible()

    // Taker profile deals
    await taker.page.goto('/#/me/deals')
    await expect(taker.page.getByText('Initiated').first()).toBeVisible({ timeout: 15000 })
    await expect(taker.page.getByText(/Buy .* USDC/).first()).toBeVisible()
    await expect(taker.page.getByText(/15 EUR/).first()).toBeVisible()
    await expect(taker.page.getByText(/Bank Transfer/).first()).toBeVisible()
  })
})
