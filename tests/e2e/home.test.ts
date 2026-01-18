import { test, expect } from './setup'

test('home page screenshot', async ({ page }) => {
  await page.goto('/');
  // Wait for the page to be ready
  await expect(page).toHaveTitle(/PEXFI/);

  // Wait for the header to be visible to ensure content is rendered
  await expect(page.locator('.ant-layout-header')).toBeVisible();

  await page.screenshot({ path: '.cache/playwright/screenshots/home.png' });
});
