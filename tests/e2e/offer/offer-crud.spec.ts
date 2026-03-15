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
      await expect(page.locator('.ant-skeleton')).not.toBeVisible()
    })
  })

  test.describe('Read', () => {
    test('displays created offer details in read-only mode', async () => {
      await expect(page.locator('.ant-radio-button-input').first()).toBeDisabled()
      await expect(page.locator('.ant-form-item-control:has(#token)')).toContainText('WETH')
      await expect(page.locator('#token')).toBeDisabled()
      await expect(page.locator('.ant-form-item-control:has(#fiat)')).toContainText('EUR')
      await expect(page.locator('#fiat')).toBeDisabled()
      await expect(page.locator('.ant-form-item-control:has(#method)')).toContainText('Bank Transfer')
      await expect(page.locator('#method')).toBeDisabled()
    })
  })

  test.describe('Update', () => {
    test('updates the margin rate', async () => {
      await page.getByLabel('Margin').fill('3')
      await page.getByRole('button', { name: 'Update' }).first().click()
      await expect(page.getByText('Rate updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Rate updated', { exact: true })).not.toBeVisible()
    })

    test('updates the limits', async () => {
      await page.getByLabel('Limits').fill('101')
      await page.getByLabel('-', { exact: true }).fill('501')
      await page.getByRole('button', { name: 'Update' }).nth(1).click()
      await expect(page.getByText('Limits updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Limits updated', { exact: true })).not.toBeVisible()
    })

    test('updates the terms', async () => {
      await page.getByLabel('Terms').fill('updated e2e terms')
      await page.getByRole('button', { name: 'Update' }).nth(2).click()
      await expect(page.getByText('Terms updated', { exact: true })).toBeVisible()
      await expect(page.getByText('Terms updated', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('Disable', () => {
    test('disables the offer', async () => {
      await page.getByRole('button', { name: 'Disable' }).click()
      await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible()
    })

    test('enables the offer', async () => {
      await page.getByRole('button', { name: 'Enable' }).click()
      await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible()
    })
  })
})
