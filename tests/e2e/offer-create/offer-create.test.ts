import { expect, test } from '@tests/e2e/setup'

test('create an offer', async ({ page }) => {
  await page.goto('/#/trade/offer/new')

  await page.goto('http://localhost:5173/#/trade/offer/new')
  expect(page.getByText('Publish an Offer')).toBeDefined()

  await page.locator('#isSell').getByText('Buy').click()
  expect(page.locator('#isSell > .ant-radio-button-checked')).toBeDefined()

  await page.getByLabel('token').click()
  await page.getByTitle('WETH').click()

  await page.getByLabel('for').click();
  await page.getByTitle('EUR').click();

  await page.getByLabel('using').click()
  await page.getByTitle('SEPA').click()

  await page.getByLabel('Margin').click()
  await page.getByLabel('Margin').fill('2')
  await expect(page.locator('#preview')).toHaveValue(/\d+\.\d{2}/)

  await page.getByLabel('Limits').click()
  await page.getByLabel('Limits').fill('100')
  await page.getByLabel('-', { exact: true }).click()
  await page.getByLabel('-', { exact: true }).fill('500')

  await page.getByLabel('Terms').fill('e2e terms')

  await page.getByRole('button', { name: 'Deploy contract' }).click()
  await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/)
})
