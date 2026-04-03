import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'

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

export type PartyContext = {
  page: Page
  setAccount: (id: number) => Promise<void>
  createOffer: (params?: OfferParams) => Promise<OfferContext>
  close: () => Promise<void>
}

export async function createOfferOnPage(page: Page, params: OfferParams = {}): Promise<OfferContext> {
  const p: Required<OfferParams> = {
    isSell: false,
    token: 'WETH',
    fiat: 'EUR',
    method: 'Bank Transfer',
    margin: '2',
    limitMin: '100',
    limitMax: '500',
    terms: 'e2e terms',
    ...params,
  }

  await page.goto('/#/trade/offer/new')

  if (p.isSell) {
    await page.getByLabel('Sell').click()
  } else {
    await page.getByLabel('Buy').click()
  }

  await page.locator('#token').click()
  await page.getByRole('option', { name: p.token }).click()

  await page.locator('#fiat').click()
  await page.getByRole('option', { name: p.fiat }).click()

  await page.locator('#method').click()
  await page.getByRole('option', { name: p.method }).click()

  await page.locator('#rate').fill(p.margin)

  await page.locator('#minLimit').fill(p.limitMin)
  await page.locator('#maxLimit').fill(p.limitMax)

  await page.locator('#terms').fill(p.terms)

  await page.getByRole('button', { name: 'DEPLOY SMART CONTRACT' }).click()
  await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/, { timeout: 30000 })

  const address = page.url().split('/').pop()!
  return { address, params: p }
}

export async function createPartyContext(browser: import('@playwright/test').Browser, startPage = '/'): Promise<PartyContext & { ctx: BrowserContext }> {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  
  page.on('console', (msg) => {
    console.error(`[Browser Console] ${msg.text()}`)
  })
  
  await page.goto(`/#${startPage}`)
  await page.waitForFunction(() => typeof window.setAccount === 'function')

  return {
    ctx,
    page,
    setAccount: (id: number) => page.evaluate((id) => window.setAccount(id), id),
    createOffer: (params?: OfferParams) => createOfferOnPage(page, params),
    close: () => ctx.close(),
  }
}

export const test = base.extend<{
  setAccount: (id: number) => Promise<void>
  createOffer: (params?: OfferParams) => Promise<OfferContext>
  createParty: (startPage?: string) => Promise<PartyContext>
}>({
  page: async ({ page }, use) => {
    page.on('console', (msg) => {
      console.error(`[Browser Console] ${msg.text()}`)
    })
    await use(page)
  },

  setAccount: async ({ page }, use) => {
    await use(async (id) => {
      await page.waitForFunction(() => window.setAccount)
      await page.evaluate((id) => {
        window.setAccount(id)
      }, id)
    })
  },

  createOffer: async ({ page }, use) => {
    await use((params) => createOfferOnPage(page, params))
  },

  createParty: async ({ browser }, use) => {
    const contexts: BrowserContext[] = []

    await use(async (startPage = '/') => {
      const party = await createPartyContext(browser, startPage)
      contexts.push(party.ctx)

      return {
        page: party.page,
        setAccount: party.setAccount,
        createOffer: party.createOffer,
        close: party.close,
      }
    })

    for (const ctx of contexts) {
      await ctx.close()
    }
  },
})

export { expect }
