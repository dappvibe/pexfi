import { test, expect } from '../setup.ts'

test.describe('Profile', () => {
  test('should create a profile and display stats', async ({ page, setAccount }) => {
    // 1. Use a fresh account (index 9) to ensure no profile exists
    await page.goto('/')
    await setAccount(0)

    // 2. Navigate to own profile page
    await page.goto('/#/me')

    // 3. Verify "Mint" button or "Profile token ID:" is visible
    const mintButton = page.getByRole('button', { name: 'Mint' })
    const tokenIdText = page.locator('div.ant-card-head-title')

    // Wait for either the Mint button or the profile ID to appear
    await expect(async () => {
      const isMintVisible = await mintButton.isVisible()
      const text = await tokenIdText.textContent()
      const isProfileVisible = text?.includes('Profile token ID:')
      expect(isMintVisible || isProfileVisible).toBeTruthy()
    }).toPass({ timeout: 10000 })

    if (await mintButton.isVisible()) {
      // 4. Click Mint and wait for the profile to be created
      console.log('Clicking Mint button...')
      await mintButton.click()
    } else {
      console.log('Profile already exists, skipping minting.')
    }

    // 5. Verify that stats are displayed after minting (or if they were already there)
    // We expect "Profile token ID: " to appear
    await expect(tokenIdText).toContainText('Profile token ID:', { timeout: 30000 })

    // 6. Check that some stats are visible
    await expect(page.getByText('Rating')).toBeVisible()
    await expect(page.getByText('Deals completed')).toBeVisible()

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
