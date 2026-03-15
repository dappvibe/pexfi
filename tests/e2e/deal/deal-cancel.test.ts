import { test } from '@tests/e2e/setup'
import { cancel, expectState } from './actions'
import { createOffer } from '../fixtures'

test.describe.serial('Deal cancellation', () => {
  test('maker cancels before accepting', async ({ createParty }) => {
    const offerAddress = await createOffer({}, 0)
    const maker = await createParty()
    await maker.setAccount(0)

    const taker = await createParty(`/trade/offer/${offerAddress}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('Crypto Amount').fill('0.1')
    await taker.page.getByPlaceholder('Fiat Amount').fill('150')
    await taker.page.getByRole('button', { name: 'Open Deal' }).click()
    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    await cancel(maker)
    await expectState(taker, 'Cancelled')
  })
})
