import { expect } from '@playwright/test'
import type { PartyContext } from '@tests/e2e/setup'

export async function accept(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Accept Deal Agreement' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  // Check for the "Accepted" state in the progress bar or status text
  await expect(party.page.getByText('Accepted', { exact: true })).toBeVisible({ timeout: 15000 })
}

export async function fund(party: PartyContext) {
  const fundButton = party.page.getByRole('button', { name: 'Fund Protocol Escrow' })
  const approveButton = party.page.getByRole('button', { name: 'Approve Handshake' })
  const actionButton = fundButton.or(approveButton)

  await expect(actionButton).toBeVisible({ timeout: 15000 })
  const buttonText = await actionButton.textContent()

  if (buttonText?.trim() === 'Approve Handshake') {
    await approveButton.click()
    await expect(approveButton).not.toBeVisible({ timeout: 15000 })
    await expect(fundButton).toBeVisible({ timeout: 15000 })
  }

  await expect(fundButton).toBeVisible({ timeout: 15000 })
  await fundButton.click()
  // Wait for the status to change to "Funded"
  await expect(party.page.getByText('Funded', { exact: true })).toBeVisible({ timeout: 15000 })
}

export async function markPaid(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Confirm Payment Transmitted' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.getByText('Paid', { exact: true })).toBeVisible({ timeout: 15000 })
}

export async function release(party: PartyContext) {
  const btn = party.page.getByRole('button', { name: 'Release Encrypted Assets' })
  await expect(btn).toBeVisible({ timeout: 15000 })
  await btn.click()
  await expect(party.page.getByText('Released', { exact: true })).toBeVisible({ timeout: 15000 })
}

export async function dispute(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Escalate to Mediator' }).click()
}

export async function cancel(party: PartyContext) {
  await party.page.getByRole('button', { name: 'Terminate Agreement' }).click()
  await expectState(party, 'Cancelled')
}

export async function expectState(party: PartyContext, state: string) {
  // The state is visible in the progress bar or status tags
  await expect(party.page.getByText(state, { exact: true })).toBeVisible()
}

export async function sendMessage(party: PartyContext, text: string) {
  await party.page.getByPlaceholder('Enter encrypted protocol message...').fill(text)
  await party.page.getByRole('button', { name: 'Transmit Message' }).click()
}

export async function expectMessage(party: PartyContext, text: string) {
  await expect(party.page.getByText(new RegExp(`.*${text}`))).toBeVisible()
}

export async function leaveFeedback(party: PartyContext, positive: boolean, comment: string) {
  const text = positive ? 'Protocol Positive' : 'Protocol Negative'
  const label = party.page.getByText(text)
  await expect(label).toBeVisible({ timeout: 15000 })
  await label.click()
  await party.page.getByPlaceholder('How was the cryptographic exchange? Was the peer responsive?').fill(comment)
  await party.page.getByRole('button', { name: 'Bond Reputation Feedback' }).click()
  await expect(party.page.getByText('Handshake Verified')).toBeVisible()
}
