import { test, expect } from '@tests/e2e/setup'
import { accept, fund, markPaid, release, leaveFeedback } from './actions'

test.describe.serial('Deal flow', () => {
  test('maker is buying', async ({ createParty }) => {
    // Create Offer
    const maker = await createParty()
    await maker.setAccount(0)
    const offer = await maker.createOffer()

    // Open Deal
    const taker = await createParty(`/trade/offer/${offer.address}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('Crypto Amount').fill('0.1')
    await taker.page.getByPlaceholder('Fiat Amount').fill('150')
    const openButton = taker.page.getByRole('button', { name: /Approve.*|Open Deal/ })
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

    // Deal progression
    await accept(maker)
    await expect(taker.page.locator('#root').getByText('Accepted')).toBeVisible()

    await fund(taker)
    // Taker is seller, they should see "Waiting for payment"
    await expect(taker.page.getByText('Waiting for payment')).toBeVisible()
    // Maker is buyer, they should see "Paid" button
    await expect(maker.page.getByRole('button', { name: 'Paid' })).toBeVisible()
    await expect(maker.page.getByText('Waiting for payment')).not.toBeVisible()
    await markPaid(maker)
    await release(taker)

    // Feedback
    await leaveFeedback(taker, true, 'great')
    await leaveFeedback(maker, false, 'muhaha')
  })

  test('maker is selling', async ({ createParty }) => {
    // Create Sell Offer
    const maker = await createParty()
    await maker.setAccount(0)
    const offer = await maker.createOffer({ isSell: true })

    // Open Deal
    const taker = await createParty(`/trade/offer/${offer.address}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('Crypto Amount').fill('0.1')
    await taker.page.getByPlaceholder('Fiat Amount').fill('150')
    const openButton = taker.page.getByRole('button', { name: /Approve.*|Open Deal/ })
    await expect(openButton).toBeVisible()
    await openButton.click()
    await expect(taker.page.getByText('Deal submitted')).toBeVisible()
    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Deal progression - maker funds since they're selling crypto
    await accept(maker)
    await expect(taker.page.locator('#root').getByText('Accepted')).toBeVisible()

    await fund(maker)
    // Maker is seller, they should see "Waiting for payment"
    await expect(maker.page.getByText('Waiting for payment')).toBeVisible()
    // Taker is buyer, they should see "Paid" button
    await expect(taker.page.getByRole('button', { name: 'Paid' })).toBeVisible()
    await expect(taker.page.getByText('Waiting for payment')).not.toBeVisible()
    await markPaid(taker)
    await release(maker)

    // Feedback
    await leaveFeedback(taker, true, 'smooth')
    await leaveFeedback(maker, true, 'nice buyer')
  })
})
