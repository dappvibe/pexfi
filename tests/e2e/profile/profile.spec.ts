import { test, expect } from '../setup.ts'

test.describe('Profile', () => {
  test('should create a profile and display stats', async ({ page, setAccount }) => {
    // 1. Use a fresh account (index 9) to ensure no profile exists
    await page.goto('/')
    await setAccount(7)

    // 2. Navigate to own profile page
    await page.goto('/#/me')

    // 3. Verify "Mint" button is visible when no profile exists
    const mintButton = page.getByRole('button', { name: 'Mint' })
    await expect(mintButton).toBeVisible({ timeout: 10000 })

    // 4. Click Mint and wait for the profile to be created
    console.log('Clicking Mint button...')
    await mintButton.click()

    // 5. Verify that stats are displayed after minting
    // We expect "Profile token ID: " to appear
    const tokenIdText = page.locator('div.ant-card-head-title')
    await expect(tokenIdText).toContainText('Profile token ID:', { timeout: 30000 })

    // 6. Check that some stats are visible
    await expect(page.getByText('Rating')).toBeVisible()
    await expect(page.getByText('Deals completed')).toBeVisible()
    await expect(page.getByText('Disputes lost')).toBeVisible()

    // Initial stats should be 0 or '-'
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('-', { exact: true }).first()).toBeVisible() // Rating for 0 votes

    console.log('Profile created and stats verified.')
  })

  test('should display existing profile stats', async ({ page, setAccount }) => {
    // Use the same account as before (it should already have a profile now)
    await page.goto('/')
    await setAccount(7)

    await page.goto('/#/me')

    // Should NOT show Mint button
    await expect(page.getByRole('button', { name: 'Mint' })).not.toBeVisible()

    // Should show stats directly
    await expect(page.locator('div.ant-card-head-title')).toContainText('Profile token ID:')
    await expect(page.getByText('Rating')).toBeVisible()
  })
})
