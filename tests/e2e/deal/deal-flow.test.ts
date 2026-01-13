import { test, expect } from '@tests/e2e/setup'

test.describe('Deal flow', () => {
  test('maker is buying', async ({ createParty }) => {
    // Create Offer
    const maker = await createParty()
    await maker.setAccount(0)
    const offer = await maker.createOffer()

    // Open Deal
    const taker = await createParty(`/trade/offer/${offer.address}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('Crypto Amount').fill('0.1')
    // Approve once per hardhat deployment or click 'Open Deal' when approved
    const openButton = taker.page.getByRole('button', { name: 'Open Deal' })
    const approveButton = taker.page.getByRole('button', { name: /Approve \w+/ })
    const actionButton = openButton.or(approveButton)
    await expect(actionButton).toBeVisible()
    const buttonText = await actionButton.textContent()
    if (buttonText?.startsWith('Approve')) {
      await approveButton.click()
      await expect(openButton).toBeVisible()
    }
    await openButton.click()
    await expect(taker.page.getByText('Deal submitted')).toBeVisible()
    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Messaging
    await taker.page.getByPlaceholder('Message').fill('ping')
    await taker.page.getByRole('button', { name: 'Send' }).click()
    await expect(maker.page.getByText(/.*ping/)).toBeVisible()
    await maker.page.getByPlaceholder('Message').fill('pong')
    await maker.page.getByRole('button', { name: 'Send' }).click()
    await expect(taker.page.getByText(/.*pong/)).toBeVisible()

    // Maker accept deal
    await maker.page.getByRole('button', { name: 'Accept' }).click()
    await expect(maker.page.locator('#root').getByText('Accepted')).toBeVisible()
    await expect(taker.page.locator('#root').getByText('Accepted')).toBeVisible() // reactive update from logs

    await taker.page.getByRole('button', { name: 'Fund' }).click()
    await expect(taker.page.getByText('Funded')).toBeVisible()

    await maker.page.getByRole('button', { name: 'Paid' }).click()
    await taker.page.getByRole('button', { name: 'Release' }).click()

    // Feedback
    await taker.page.locator('label').filter({ hasText: 'Good' }).click()
    await taker.page.getByPlaceholder('Comments').fill('great')
    await taker.page.getByRole('button', { name: 'Submit' }).click()
    await expect(taker.page.getByText('Feedback submitted!')).toBeVisible()
    await maker.page.locator('label').filter({ hasText: 'Bad' }).click()
    await maker.page.getByPlaceholder('Comments').fill('muhaha')
    await maker.page.getByRole('button', { name: 'Submit' }).click()
    await expect(maker.page.getByText('Feedback submitted!')).toBeVisible()
  })
})
