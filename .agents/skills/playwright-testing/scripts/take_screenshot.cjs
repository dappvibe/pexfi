#!/usr/bin/env node
const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const url = process.argv[2] || 'http://localhost:5173';
  const outputPath = process.argv[3] || 'screenshot.png';

  console.log(`Navigating to ${url}...`);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (error) {
    console.error(`Failed to take screenshot: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
