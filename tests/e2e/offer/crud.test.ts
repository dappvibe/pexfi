import { expect, test } from '@tests/e2e/setup'

test('Offer CRUD', async ({ page, setAccount }) => {
  // Set account BEFORE going to the page
  await page.goto('/')
  await setAccount(0)

  // 1. Create an offer
  await page.goto('/#/trade/offer/new')

  // Wait for either the form or the skeleton
  await Promise.race([
    page.waitForSelector('#isSell', { timeout: 10000 }).catch(() => {}),
    page.waitForSelector('.ant-skeleton', { timeout: 10000 }).catch(() => {})
  ])

  // Check if we are stuck on skeleton
  const isSkeletonVisible = await page.locator('.ant-skeleton').isVisible()
  if (isSkeletonVisible) {
    // Wait a bit more to see if it's just slow
    try {
      await expect(page.locator('.ant-skeleton')).not.toBeVisible({ timeout: 5000 })
    } catch (e) {
      await page.screenshot({ path: '.cache/playwright/results/skeleton-failure.png', fullPage: true })
      throw new Error('Page stuck on <Skeleton> loading state.')
    }
  }

  // Ensure form is visible
  await expect(page.locator('#isSell')).toBeVisible({ timeout: 5000 })

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

  // 2. Read the offer
  await expect(page).toHaveURL(/.*\/trade\/offer\/0x[0-9A-f]{40}$/)

  // Wait for skeleton to disappear again (data loaded)
  await expect(page.locator('.ant-skeleton')).not.toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000) // increased stabilization delay for multiple async steps

  // Check if radio buttons are disabled
  await expect(page.locator('.ant-radio-button-input').first()).toBeDisabled()

  await expect(page.getByLabel('token')).toBeDisabled()
  await expect(page.getByLabel('for')).toBeDisabled()
  await expect(page.getByLabel('using')).toBeDisabled()

  // 3. Update the offer
  await page.getByLabel('Margin').fill('3')
  await page.getByRole('button', { name: 'Update' }).first().click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible({ timeout: 10000 })

  await page.getByLabel('Limits').fill('101')
  await page.getByLabel('-', { exact: true }).fill('501')
  await page.getByRole('button', { name: 'Update' }).nth(1).click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible({ timeout: 10000 })

  await page.getByLabel('Terms').fill('updated e2e terms')
  await page.getByRole('button', { name: 'Update' }).nth(2).click()
  await expect(page.getByText('Updated', { exact: true })).toBeVisible()
  await expect(page.getByText('Updated', { exact: true })).not.toBeVisible({ timeout: 10000 })

  // 4. Disable the offer
  await page.getByRole('button', { name: 'Disable' }).click()
  await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible()

  // 5. Enable the offer
  await page.getByRole('button', { name: 'Enable' }).click()
  await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible()
})
