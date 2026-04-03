import { test, expect } from '../setup.ts'

test.describe('Profile', () => {
  test('should create a profile and display stats', async ({ page, setAccount }) => {
    // 1. Use a fresh account (index 9) to ensure no profile exists
    await page.goto('/')
    await setAccount(7)

    // 2. Navigate to own profile page
    await page.goto('/#/me')

    // 3. Verify "Mint Reputation NFT" button is visible when no profile exists
    const mintButton = page.getByRole('button', { name: 'Mint Reputation NFT' })
    await expect(mintButton).toBeVisible({ timeout: 10000 })

    // 4. Click Mint and wait for the profile to be created
    console.log('Clicking Mint button...')
    await mintButton.click()

    // 5. Verify that stats are displayed after minting
    // We expect "Protocol Reputation Node #" to appear
    await expect(page.getByText('Protocol Reputation Node #', { exact: false })).toBeVisible({ timeout: 30000 })

    // 6. Check that some stats are visible
    await expect(page.getByText('Trust Score Index')).toBeVisible()
    await expect(page.getByText('Deals Completed')).toBeVisible()

    // Initial stats should be 0
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible()

    console.log('Profile created and stats verified.')
  })

  test('should display existing profile stats', async ({ page, setAccount }) => {
    // Use the same account as before (it should already have a profile now)
    await page.goto('/')
    await setAccount(7)

    await page.goto('/#/me')

    // Should NOT show Mint button
    await expect(page.getByRole('button', { name: 'Mint Reputation NFT' })).not.toBeVisible()

    // Should show stats directly
    await expect(page.getByText('Protocol Reputation Node #', { exact: false })).toBeVisible()
    await expect(page.getByText('Trust Score Index')).toBeVisible()
  })
})
