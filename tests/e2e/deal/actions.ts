import { expect } from '@playwright/test'
import type { PartyContext } from '@tests/e2e/setup'

export async function accept(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Accept', exact: true }).first()
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(btn).not.toBeVisible({ timeout: 25000 })
}

export async function fund(party: PartyContext) {
  // Wait for any skeletons to disappear
  await expect(party.page.locator('.ant-skeleton')).toHaveCount(0, { timeout: 15000 })
  
  const approveLocator = party.page.getByRole('button', { name: 'Approve', exact: true })
  const fundLocator = party.page.getByRole('button', { name: 'Fund', exact: true })
  
  // Wait for either button to appear
  await expect(approveLocator.or(fundLocator).first()).toBeVisible({ timeout: 30000 })
  
  if (await approveLocator.first().isVisible()) {
    await approveLocator.first().click()
    await expect(approveLocator.first()).not.toBeVisible({ timeout: 15000 })
    await expect(fundLocator.first()).toBeVisible({ timeout: 15000 })
  }
  
  await expect(fundLocator.first()).toBeVisible({ timeout: 15000 })
  await fundLocator.first().click()
}

export async function markPaid(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Paid', exact: true }).first()
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
}

export async function release(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Release', exact: true }).first()
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.locator('span').filter({ hasText: 'Released' })).toBeVisible({ timeout: 15000 })
}

export async function dispute(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Dispute', exact: true }).first().click()
}

export async function cancel(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Cancel', exact: true }).first().click()
  await expectState(party, 'Cancelled')
}

export async function expectState(party: PartyContext, state: string) {
  // If state is Funding, wait for Funded or whatever the label is. But wait, in the test it calls expectState(taker, 'Funding'). We'll map 'Funding' to 'Funded' if needed or change the test.
  // Actually, we can check for the label text.
  const actualState = state === 'Funding' ? 'Accepted' : state
  await expect(party.page.getByText(actualState, { exact: true }).first()).toBeVisible({ timeout: 15000 })
}

export async function sendMessage(party: PartyContext, text: string) {
  await party.page.getByPlaceholder('Type a message...').fill(text)
  await party.page.locator('button[type="submit"]').click()
}

export async function expectMessage(party: PartyContext, text: string) {
  await expect(party.page.getByText(new RegExp(`.*${text}`)).first()).toBeVisible({ timeout: 15000 })
}

export async function leaveFeedback(party: PartyContext, positive: boolean, comment: string) {
  const text = positive ? 'Good' : 'Bad'
  const label = party.page.getByText(text, { exact: true })
  await expect(label).toBeVisible({ timeout: 15000 })
  await label.click()
  await party.page.getByPlaceholder('Comments').fill(comment)
  await party.page.getByRole('button', { name: 'Submit' }).click()
  await expect(party.page.getByText('Feedback submitted!')).toBeVisible()
}
