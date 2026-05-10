import { test, expect } from '@tests/e2e/setup'
import { sendMessage, expectMessage } from './actions'
import { createOffer } from '../fixtures'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe.serial('Deal messaging', () => {
  test('parties can exchange messages and images', async ({ createParty }) => {
    test.setTimeout(60000)
    const offerAddress = await createOffer({}, 0)
    const maker = await createParty()
    await maker.setAccount(0)

    const taker = await createParty(`/trade/offer/${offerAddress}`)
    await taker.setAccount(1)
    await taker.page.locator('#tokenAmount').fill('0.1')
    await taker.page.locator('#fiatAmount').fill('150')
    await taker.page.getByRole('button', { name: 'Accept Offer & Create Deal' }).click()
    await expect(taker.page.getByText('Deal submitted')).toBeVisible()
    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Text messages
    await sendMessage(taker, 'hello from taker')
    await expectMessage(maker, 'hello from taker')

    await sendMessage(maker, 'hello from maker')
    await expectMessage(taker, 'hello from maker')
  })
})
