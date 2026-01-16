import { expect } from '@playwright/test'
import type { PartyContext } from '@tests/e2e/setup'

export async function accept(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Accept' }).click()
  await expect(party.page.locator('#root').getByText('Accepted')).toBeVisible()
}

export async function fund(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Fund' }).click()
  await expect(party.page.locator('span').filter({ hasText: 'Funded' })).toBeVisible()
}

export async function markPaid(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Paid' }).click()
}

export async function release(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Release' }).click()
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
  await party.page.locator('label').filter({ hasText: positive ? 'Good' : 'Bad' }).click()
  await party.page.getByPlaceholder('Comments').fill(comment)
  await party.page.getByRole('button', { name: 'Submit' }).click()
  await expect(party.page.getByText('Feedback submitted!')).toBeVisible()
}
