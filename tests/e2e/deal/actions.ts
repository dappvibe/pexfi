import { expect } from '@playwright/test'
import type { PartyContext } from '@tests/e2e/setup'

export async function accept(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Accept' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.locator('#root').getByText('Accepted')).toBeVisible({ timeout: 15000 })
}

export async function fund(party: PartyContext) {
  const fundButton = party.page.getByRole('button', { name: 'Fund' })
  const approveButton = party.page.getByRole('button', { name: 'Approve' })
  const actionButton = fundButton.or(approveButton)
  await expect(actionButton).toBeVisible()
  const buttonText = await actionButton.textContent()
  if (buttonText?.trim() === 'Approve') {
    await approveButton.click()
    await expect(approveButton).not.toBeVisible({ timeout: 15000 })
    await expect(fundButton).toBeVisible({ timeout: 15000 })
  }




  await expect(fundButton).toBeVisible({ timeout: 15000 })
  await fundButton.click()
  await expect(party.page.locator('span').filter({ hasText: 'Funded' })).toBeVisible({ timeout: 15000 })
}

export async function markPaid(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Paid' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.locator('span').filter({ hasText: 'Paid' })).toBeVisible({ timeout: 15000 })
}

export async function release(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Release' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.locator('span').filter({ hasText: 'Released' })).toBeVisible({ timeout: 15000 })
}

export async function dispute(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Dispute' }).click()
}

export async function cancel(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Cancel' }).click()
  await expectState(party, 'Cancelled')
}

export async function expectState(party: PartyContext, state: string) {
  await expect(party.page.locator('.ant-steps').getByText(state)).toBeVisible()
}

export async function sendMessage(party: PartyContext, text: string) {
  await party.page.getByPlaceholder('Message').fill(text)
  await party.page.getByRole('button', { name: 'Send' }).click()
}

export async function expectMessage(party: PartyContext, text: string) {
  await expect(party.page.getByText(new RegExp(`.*${text}`))).toBeVisible()
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
