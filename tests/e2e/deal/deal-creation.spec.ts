import { expect, test } from '@tests/e2e/setup'
import { createOffer } from '@tests/e2e/fixtures'

test.describe('Deal Creation Flow', () => {
  test('Offer page redirect to created deal', async ({ page, setAccount }) => {
    // We use Account 0 to create the offer
    const offerAddress = await createOffer({
      isSell: true,
      margin: 2,
      limitMin: 10,
      limitMax: 100,
      fiat: 'EUR',
      terms: 'e2e sell offer terms',
    }, 0)

    // 2. Open the offer page as Taker (Account 1)
    await page.goto(`/#/trade/offer/${offerAddress}`)
    await setAccount(1)


    // 3. Try to open a deal
    await page.getByPlaceholder('Fiat Amount').fill('50')
    const openDealButton = page.getByRole('button', { name: 'Open Deal' })
    await openDealButton.click()

    // 4. Wait for the deal page to appear
    await expect(page).toHaveURL(/.*\/trade\/deal\/0x[0-9A-f]{40}$/, { timeout: 30000 })
    //const dealAddress = page.url().split('/').pop()!

    // 5. Verify the deal page is loaded
    await expect(page.getByText('Price')).toBeVisible()
    await expect(page.getByText('Payment instructions')).toBeVisible()
  })
})
