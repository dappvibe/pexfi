---
name: playwright-testing
description: End-to-end (e2e) testing with Playwright. Use when Gemini CLI needs to run, debug, or create browser-based tests, take screenshots, or verify UI flows in a web application.
---

# Playwright Testing

This skill provides guidance and tools for running and maintaining end-to-end tests using Playwright.

## Workflow

### 1. Running Tests
To run tests, use the following commands:
- **Run all tests:** `npx playwright test --headed --reporter=line`
- **Run a specific test file:** `npx playwright test tests/e2e/path/to/test.ts --headed --reporter=line`
- **MUST run in headed mode:** Add the `--headed` flag.
- **Always use line reporter:** Add `--reporter=line` to see output in the CLI.
- **Debug a test:** `npx playwright test --debug`

### 2. Debugging Failures
When a test fails:
1.  **Read the CLI Output:** Use `--reporter=line` to get immediate, high-signal error messages and stack traces directly in your terminal.
2.  **Inspect Browser Console:** Look for `[Browser Console]` entries in the CLI output (forwarded via `setup.ts`) to identify frontend crashes or network errors.
3.  **Take a Screenshot (if needed):** Use the `take_screenshot.cjs` script if you need to visually verify the page state.

### 3. Creating New Tests
Follow the existing patterns in `tests/e2e/`.
- **Custom Setup:** Use `tests/e2e/setup.ts` which provides utilities like `setAccount` for wallet interactions.
- **Fast Setup with Fixtures:** For faster test setup (bypassing the UI), use `createOffer` and `createDeal` from `@tests/e2e/fixtures`. These functions use direct JSON RPC calls via `viem`.

Example usage:
```typescript
import { createOffer, createDeal } from '@tests/e2e/fixtures'

test('full deal flow', async ({ page }) => {
  const offer = await createOffer({ isSell: true }, 0)
  const deal = await createDeal(offer, { fiatAmount: 100 }, 1)
  await page.goto(`/#/trade/deal/${deal}`)
  // ... continue with UI-based verification
})
```

## Environment Setup
- **Frontend Startup:** The frontend runs via `docker compose up web`.
- **Check for Existing Containers:** Before attempting to start any services, check if they are already running. If the container is active, **MUST NOT** spawn a new development server.
- **Base URL:** Tests connect to `http://localhost:5173` (mapped from the container).

## Troubleshooting
- **Wallet Interactions:** Use the `setAccount(index)` utility from `@tests/e2e/setup` to simulate different users.
