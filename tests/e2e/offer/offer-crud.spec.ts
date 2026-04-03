import { expect, test, type PartyContext, createPartyContext } from '@tests/e2e/setup'
import { type Page } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

let party: PartyContext
let page: Page // keep backward compatibility in test blocks for brevity

test.beforeAll(async ({ browser }) => {
  party = await createPartyContext(browser)
  page = party.page
  await party.setAccount(0)
})

test.afterAll(async () => {
  await party.close()
})

test.describe('Offer CRUD', () => {
  test.describe('Create', () => {
    test('creates and deploys a new offer', async () => {
      await party.createOffer({
        token: 'WETH',
        fiat: 'EUR',
        method: 'Bank Transfer',
        margin: '2',
        limitMin: '100',
        limitMax: '500',
        terms: 'e2e terms',
      })
      await expect(page.getByText('Liquidity Provisioning')).toBeVisible()
    })
  })

  test.describe('Read', () => {
    test('displays created offer details in read-only mode', async () => {
      await expect(page.locator('#token')).toBeDisabled()
      await expect(page.getByText('WETH', { exact: false })).toBeVisible()
      await expect(page.locator('#fiat')).toBeDisabled()
      await expect(page.getByText('EUR', { exact: false })).toBeVisible()
      await expect(page.locator('#method')).toBeDisabled()
      await expect(page.getByText('Bank Transfer', { exact: false })).toBeVisible()
    })
  })

  test.describe('Update', () => {
    test('updates the margin rate', async () => {
      await page.locator('#rate').fill('3')
      await page.getByRole('button', { name: 'Update' }).first().click()
      await expect(page.getByText('Rate updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Rate updated', { exact: true })).not.toBeVisible()
    })

    test('updates the limits', async () => {
      await page.locator('#minLimit').fill('101')
      await page.locator('#maxLimit').fill('501')
      await page.getByRole('button', { name: 'Update' }).nth(1).click()
      await expect(page.getByText('Limits updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Limits updated', { exact: true })).not.toBeVisible()
    })

    test('updates the terms', async () => {
      await page.locator('#terms').fill('updated e2e terms')
      await page.getByRole('button', { name: 'Update Terms' }).click()
      await expect(page.getByText('Terms updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Terms updated', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('Disable', () => {
    test('disables the offer', async () => {
      await page.getByRole('button', { name: 'DEACTIVATE PROTOCOL NODE' }).click()
      await expect(page.getByRole('button', { name: 'ACTIVATE PROTOCOL NODE' })).toBeVisible()
    })

    test('enables the offer', async () => {
      await page.getByRole('button', { name: 'ACTIVATE PROTOCOL NODE' }).click()
      await expect(page.getByRole('button', { name: 'DEACTIVATE PROTOCOL NODE' })).toBeVisible()
    })
  })
})
