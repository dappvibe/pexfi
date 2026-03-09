import { test, expect } from '@tests/e2e/setup'
import { createOffer, createDeal } from '@tests/e2e/fixtures'
import { accept, fund, markPaid, release } from './actions'

test.describe('Profile Deals', () => {
  test('should display new and completed deals in profile', async ({ page, createParty }) => {
    // 1. Setup Maker and Taker with profiles
    const maker = await createParty()
    await maker.setAccount(0)
    await maker.page.goto('/#/me')
    // Wait for the page to load and stabilize
    await maker.page.waitForTimeout(2000)
    
    // Check if we need to mint
    const mintMaker = maker.page.getByRole('button', { name: 'Mint' })
    if (await mintMaker.isVisible()) {
      await mintMaker.click()
      await expect(maker.page.locator('div.ant-card-head-title')).toContainText('Profile token ID:', { timeout: 30000 })
    }

    const taker = await createParty()
    await taker.setAccount(1)
    await taker.page.goto('/#/me')
    await taker.page.waitForTimeout(2000)
    
    const mintTaker = taker.page.getByRole('button', { name: 'Mint' })
    if (await mintTaker.isVisible()) {
      await mintTaker.click()
      await expect(taker.page.locator('div.ant-card-head-title')).toContainText('Profile token ID:', { timeout: 30000 })
    }

    // 2. Create Offer and Deal via fixtures (fast)
    // Maker is selling USDC (default token in fixtures)
    const offerAddress = await createOffer({ isSell: true }, 0)
    const dealAddress = await createDeal(offerAddress, { fiatAmount: 15 }, 1)

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

    // 4. Progress the deal to completion
    await maker.page.goto(`/#/trade/deal/${dealAddress}`)
    await taker.page.goto(`/#/trade/deal/${dealAddress}`)

    await accept(maker)
    await fund(maker)
    await markPaid(taker)
    await release(maker)

    // 5. Check "Completed" deal in profile for both
    await maker.page.goto('/#/me/deals')
    await expect(maker.page.getByText('Completed').first()).toBeVisible({ timeout: 15000 })

    await taker.page.goto('/#/me/deals')
    await expect(taker.page.getByText('Completed').first()).toBeVisible({ timeout: 15000 })

    // 6. Check stats on profile page
    await maker.page.goto('/#/me')
    // In vertical layout, they are just divs with content. 
    // Based on ProfilePage.tsx: Registered(0), Rating(1), Deals completed(2)
    const makerStats = maker.page.locator('.ant-descriptions-item-content').nth(2)
    await expect(makerStats).not.toHaveText('0', { timeout: 30000 })
    await expect(makerStats).toBeVisible()

    await taker.page.goto('/#/me')
    const takerStats = taker.page.locator('.ant-descriptions-item-content').nth(2)
    await expect(takerStats).not.toHaveText('0', { timeout: 30000 })
    await expect(takerStats).toBeVisible()
  })
})
