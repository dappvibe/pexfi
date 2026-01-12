import { test as base, expect } from '@playwright/test'

/**
 * Custom test extension to set up E2E environment.
 * It injects a script into the page to set `window.E2E = true`
 * so that the application can detect it's running in an E2E test context.
 */

export type OfferParams = {
  isSell?: boolean
  token?: string
  fiat?: string
  method?: string
  margin?: string
  limitMin?: string
  limitMax?: string
  terms?: string
}

export type OfferContext = {
  address: string
  params: Required<OfferParams>
}

export const test = base.extend<{
  createOffer: (params?: OfferParams) => Promise<OfferContext>
}>({
  page: async ({ page }, next) => {
    await page.addInitScript(() => {
      window.E2E = true
    })
    await next(page)
  },

  createOffer: async ({ page }, use) => {
    await use(async (params = {}) => {
      const p: Required<OfferParams> = {
        isSell: false,
        token: 'WETH',
        fiat: 'EUR',
        method: 'SEPA',
        margin: '2',
        limitMin: '100',
        limitMax: '500',
        terms: 'e2e terms',
        ...params,
      }

      await page.goto('/#/trade/offer/new')

      if (p.isSell) {
        await page.locator('#isSell').getByText('Sell').click()
      } else {
        await page.locator('#isSell').getByText('Buy').click()
      }

      await page.getByLabel('token').click()
      await page.getByTitle(p.token).click()

      await page.getByLabel('for').click()
      await page.getByTitle(p.fiat).click()

      await page.getByLabel('using').click()
      await page.getByTitle(p.method).click()

      await page.getByLabel('Margin').click()
      await page.getByLabel('Margin').fill(p.margin)

      await page.getByLabel('Limits').fill(p.limitMin)
      await page.getByLabel('-', { exact: true }).fill(p.limitMax)

      await page.getByLabel('Terms').fill(p.terms)

      await page.getByRole('button', { name: 'Deploy contract' }).click()
      await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/)

      const address = page.url().split('/').pop()!
      return { address, params: p }
    })
  },
})

export { expect }
