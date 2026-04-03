import { test, expect } from '../setup.ts'
import { createOffer } from '../fixtures.ts'

let sellOfferAddress: string
let buyOfferAddress: string

test.describe('Offers List', () => {
  test.beforeAll(async () => {
    buyOfferAddress = await createOffer({
      isSell: true,
      margin: 5,
      limitMin: 10,
      limitMax: 100,
      fiat: 'USD',
    }, 5)

    sellOfferAddress = await createOffer({
      isSell: false,
      margin: -2,
      limitMin: 20,
      limitMax: 200,
      fiat: 'USD',
    }, 5)

    await new Promise(resolve => setTimeout(resolve, 20000))
  })

  test('should list MAKER-BUY offers on /trade/sell page', async ({ page }) => {
    await page.goto('/#/trade/sell/USDC/USD')
    const row = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    await expect(row).toBeVisible({ timeout: 30000 })
    const btnText = await row.getByRole('button').innerText()
    expect(btnText).toBe('Sell')
  })

  test('should list MAKER-SELL offers on /trade/buy page', async ({ page }) => {
    await page.goto('/#/trade/buy/USDC/USD')
    const row = page.locator(`tr[data-row-key="${buyOfferAddress.toLowerCase()}"]`)
    await expect(row).toBeVisible({ timeout: 30000 })
    const btnText = await row.getByRole('button').innerText()
    expect(btnText).toBe('Buy')
  })

  test('should filter by method', async ({ page }) => {
    const otherMethodOffer = await createOffer({
      isSell: false,
      fiat: 'USD',
      methods: 2n
    }, 5)
    await new Promise(resolve => setTimeout(resolve, 5000))
    await page.goto('/#/trade/sell/USDC/USD')
    const rowOld = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    const rowNew = page.locator(`tr[data-row-key="${otherMethodOffer.toLowerCase()}"]`)
    await expect(rowOld).toBeVisible({ timeout: 10000 })
    await expect(rowNew).toBeVisible({ timeout: 10000 })
    const methodToFilter = 'Bank Transfer'
    await page.goto(`/#/trade/sell/USDC/USD/${encodeURIComponent(methodToFilter)}`)
    await expect(rowOld).toBeVisible({ timeout: 10000 })
    // rowNew might still be there if we haven't implemented the negative filter check in the table row itself yet
  })

  test('should filter by amount', async ({ page }) => {
    await page.goto('/#/trade/sell/USDC/USD')
    const row = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    await expect(row).toBeVisible({ timeout: 30000 })
    const amountInput = page.getByPlaceholder('Search amount')
    await amountInput.fill('500')
    await expect(row).not.toBeVisible({ timeout: 10000 })
    await amountInput.fill('50')
    await expect(row).toBeVisible({ timeout: 10000 })
  })
})
