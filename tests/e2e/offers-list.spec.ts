import { test, expect } from './setup'
import { createOffer } from './fixtures'

let sellOfferAddress: string
let buyOfferAddress: string

test.describe('Offers List', () => {
  // Use a single beforeAll to create both offers and wait for indexing
  test.beforeAll(async () => {
    console.log('--- Creating offers for E2E tests ---')
    
    // MAKER SELLS USDC (appears on /trade/buy for taker)
    // We use account 5 so it doesn't conflict with account 0 (default in browser)
    buyOfferAddress = await createOffer({
      isSell: true, 
      margin: 5,
      limitMin: 10,
      limitMax: 100,
      fiat: 'USD',
    }, 5)
    console.log(`Created Maker-Sell offer (isSell=true) at ${buyOfferAddress}`)

    // MAKER BUYS USDC (appears on /trade/sell for taker)
    sellOfferAddress = await createOffer({
      isSell: false,
      margin: -2,
      limitMin: 20,
      limitMax: 200,
      fiat: 'USD',
    }, 5)
    console.log(`Created Maker-Buy offer (isSell=false) at ${sellOfferAddress}`)

    console.log('Waiting 20s for subgraph indexing...')
    await new Promise(resolve => setTimeout(resolve, 20000))
  })

  test('should list MAKER-BUY offers on /trade/sell page', async ({ page }) => {
    // /trade/sell -> Taker wants to sell -> Maker must be buying (isSell=false)
    await page.goto('/#/trade/sell/USDC/USD')
    console.log(`Navigated to /trade/sell/USDC/USD. Looking for ${sellOfferAddress}`)
    
    const row = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    
    // Wait for the specific row to be visible
    await expect(row).toBeVisible({ timeout: 30000 })
    
    // Log button text for debugging
    const btnText = await row.getByRole('button').innerText()
    console.log(`Button text for ${sellOfferAddress}: ${btnText}`)
    
    // Taker wants to sell, so the button should say "Sell"
    expect(btnText).toBe('Sell')
  })

  test('should list MAKER-SELL offers on /trade/buy page', async ({ page }) => {
    // /trade/buy -> Taker wants to buy -> Maker must be selling (isSell=true)
    await page.goto('/#/trade/buy/USDC/USD')
    console.log(`Navigated to /trade/buy/USDC/USD. Looking for ${buyOfferAddress}`)
    
    const row = page.locator(`tr[data-row-key="${buyOfferAddress.toLowerCase()}"]`)
    
    await expect(row).toBeVisible({ timeout: 30000 })
    
    const btnText = await row.getByRole('button').innerText()
    console.log(`Button text for ${buyOfferAddress}: ${btnText}`)
    
    // Taker wants to buy, so the button should say "Buy"
    expect(btnText).toBe('Buy')
  })

  test('should filter by method', async ({ page }) => {
    // Both offers created in beforeAll have methods: 1n by default (index 0).
    // Let's create another offer with a different method (e.g. methods: 2n - index 1)
    const otherMethodOffer = await createOffer({
      isSell: false,
      fiat: 'USD',
      methods: 2n
    }, 5)
    
    // Give time for indexing
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Navigate to the method filter for index 0 (which should be "Bank Transfer" or whatever 1n maps to)
    // Actually, we can check by navigating first to the non-filtered list,
    // getting the text of the method tag from the first offer, and then navigating to that.
    await page.goto('/#/trade/sell/USDC/USD')
    
    const rowOld = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    const rowNew = page.locator(`tr[data-row-key="${otherMethodOffer.toLowerCase()}"]`)
    
    await expect(rowOld).toBeVisible({ timeout: 10000 })
    await expect(rowNew).toBeVisible({ timeout: 10000 })
    
    // Get the method text from the rowOld
    const methodTag = rowOld.locator('.ant-tag').first()
    const methodText = await methodTag.innerText()
    
    // Now filter by this specific method
    await page.goto(`/#/trade/sell/USDC/USD/${encodeURIComponent(methodText)}`)
    
    // rowOld should still be visible because it matches the method
    await expect(rowOld).toBeVisible({ timeout: 10000 })
    // rowNew should NOT be visible because it has methods: 2n (which is a different method index)
    await expect(rowNew).not.toBeVisible({ timeout: 10000 })
  })

  test('should filter by amount', async ({ page }) => {
    await page.goto('/#/trade/sell/USDC/USD')
    
    const row = page.locator(`tr[data-row-key="${sellOfferAddress.toLowerCase()}"]`)
    await expect(row).toBeVisible({ timeout: 30000 })
    
    // sellOfferAddress has limits 20-200 USD.
    const amountInput = page.getByPlaceholder('Amount')
    
    console.log('Filtering for 500 USD (out of range)...')
    await amountInput.fill('500')
    // Should disappear (or at least not be visible in the current results)
    await expect(row).not.toBeVisible({ timeout: 10000 })
    
    console.log('Filtering for 50 USD (in range)...')
    await amountInput.fill('50')
    await expect(row).toBeVisible({ timeout: 10000 })
  })
})
