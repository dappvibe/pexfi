import { expect, test } from '@e2e/setup'

test('Offer CRUD', async ({ page, setAccount }) => {
  // 1. Create an offer
  await page.goto('/#/trade/offer/new')
  expect(page.getByText('Publish an Offer')).toBeDefined()

  await setAccount(0)

  await page.locator('#isSell').getByText('Buy').click()
  expect(page.locator('#isSell > .ant-radio-button-checked')).toBeDefined()

  await page.getByLabel('token').click()
  await page.getByTitle('WETH').click()

  await page.getByLabel('for').click()
  await page.getByTitle('EUR').click()

  await page.getByLabel('using').click()
  await page.getByTitle('SEPA').click()

  await page.getByLabel('Margin').click()
  await page.getByLabel('Margin').fill('2')
  await expect(page.locator('#preview')).toHaveValue(/\d+\.\d{2}/)

  await page.getByLabel('Limits').fill('100')
  await page.getByLabel('-', { exact: true }).fill('500')

  await page.getByLabel('Terms').fill('e2e terms')

  await page.getByRole('button', { name: 'Deploy contract' }).click()

  // 2. Read the offer
  await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/)
  await expect(page.getByLabel('Buy')).toBeDisabled()
  await expect(page.getByLabel('token')).toBeDisabled()
  await expect(page.getByLabel('for')).toBeDisabled()
  await expect(page.getByLabel('using')).toBeDisabled()

  // 3. Update the offer
  await page.getByLabel('Margin').fill('3')
  await page.getByRole('button', { name: 'Update' }).first().click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible()

  await page.getByLabel('Limits').fill('101')
  await page.getByLabel('-', { exact: true }).fill('501')
  await page.getByRole('button', { name: 'Update' }).nth(1).click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible()

  await page.getByLabel('Terms').fill('updated e2e terms')
  await page.getByRole('button', { name: 'Update' }).nth(2).click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible()

  // 4. Disable the offer
  await page.getByRole('button', { name: 'Disable' }).click()
  await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible()

  // 5. Enable the offer
  await page.getByRole('button', { name: 'Enable' }).click()
  await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible()
})
