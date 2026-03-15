import { expect, test } from '@tests/e2e/setup'

test.describe('Offer CRUD', () => {
  test('Create and Read', async ({ page, setAccount }) => {
    await page.goto('/')
    await setAccount(0)

    await page.goto('/#/trade/offer/new')

    await expect(page.locator('#isSell')).toBeVisible()
    expect(page.getByText('Publish an Offer')).toBeDefined()

    await page.locator('#isSell').getByText('Buy').click()
    expect(page.locator('#isSell > .ant-radio-button-checked')).toBeDefined()

    await page.getByLabel('token').click()
    await page.getByTitle('WETH').click()

    await page.getByLabel('for').click()
    await page.getByTitle('EUR').click()

    await page.getByLabel('using').click()
    await page.getByTitle('Bank Transfer').click()

    await page.getByLabel('Margin').click()
    await page.getByLabel('Margin').fill('2')
    await expect(page.locator('#preview')).toHaveValue(/\d+\.\d{2}/)

    await page.getByLabel('Limits').fill('100')
    await page.getByLabel('-', { exact: true }).fill('500')

    await page.getByLabel('Terms').fill('e2e terms')

    await page.getByRole('button', { name: 'Deploy contract' }).click()

    await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/, { timeout: 30000 })
    await expect(page.locator('.ant-skeleton')).not.toBeVisible()

    await expect(page.locator('.ant-radio-button-input').first()).toBeDisabled()
    await expect(page.getByLabel('token')).toBeDisabled()
    await expect(page.getByLabel('for')).toBeDisabled()
    await expect(page.getByLabel('using')).toBeDisabled()
  })

  test('Update', async ({ page, setAccount, createOffer }) => {
    await page.goto('/')
    await setAccount(0)
    await createOffer({
      token: 'WETH',
      fiat: 'EUR',
      method: 'Bank Transfer',
    })

    await expect(page.locator('.ant-skeleton')).not.toBeVisible()

    await expect(page.locator('.ant-radio-button-input').first()).toBeDisabled()
    await expect(page.locator('.ant-form-item-control:has(#token)')).toContainText('WETH')
    await expect(page.locator('#token')).toBeDisabled()
    await expect(page.locator('.ant-form-item-control:has(#fiat)')).toContainText('EUR')
    await expect(page.locator('#fiat')).toBeDisabled()
    await expect(page.locator('.ant-form-item-control:has(#method)')).toContainText('Bank Transfer')
    await expect(page.locator('#method')).toBeDisabled()

    await page.getByLabel('Margin').fill('3')
    await page.getByRole('button', { name: 'Update' }).first().click()
    await expect(page.getByText('Rate updated', { exact: true })).toBeVisible()
    await expect(page.getByText('Rate updated', { exact: true })).not.toBeVisible()

    await page.getByLabel('Limits').fill('101')
    await page.getByLabel('-', { exact: true }).fill('501')
    await page.getByRole('button', { name: 'Update' }).nth(1).click()
    await expect(page.getByText('Limits updated', { exact: true })).toBeVisible()
    await expect(page.getByText('Limits updated', { exact: true })).not.toBeVisible()

    await page.getByLabel('Terms').fill('updated e2e terms')
    await page.getByRole('button', { name: 'Update' }).nth(2).click()
    await expect(page.getByText('Terms updated', { exact: true })).toBeVisible()
    await expect(page.getByText('Terms updated', { exact: true })).not.toBeVisible()
  })

  test('Disable and Enable', async ({ page, setAccount, createOffer }) => {
    await page.goto('/')
    await setAccount(0)
    await createOffer()

    await expect(page.locator('.ant-skeleton')).not.toBeVisible()

    await page.getByRole('button', { name: 'Disable' }).click()
    await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible()

    await page.getByRole('button', { name: 'Enable' }).click()
    await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible()
  })
})
