import { test, expect } from '@e2e/setup'
import { sendMessage, expectMessage } from './actions'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('Deal messaging', () => {
  test('parties can exchange messages and images', async ({ createParty }) => {
    const maker = await createParty()
    await maker.setAccount(0)
    const offer = await maker.createOffer()

    const taker = await createParty(`/trade/offer/${offer.address}`)
    await taker.setAccount(1)
    await taker.page.getByPlaceholder('Crypto Amount').fill('0.1')
    await taker.page.getByRole('button', { name: 'Open Deal' }).click()
    await expect(taker.page.getByText('Deal submitted')).toBeVisible()
    await taker.page.waitForURL(/\/trade\/deal\/0x[a-fA-F0-9]{40}/)
    const dealAddress = taker.page.url().split('/').pop()
    await maker.page.goto('/#/trade/deal/' + dealAddress)

    // Text messages
    await sendMessage(taker, 'hello from taker')
    await expectMessage(maker, 'hello from taker')

    await sendMessage(maker, 'hello from maker')
    await expectMessage(taker, 'hello from maker')

    // Image uploads
    const logoPath = path.resolve(__dirname, '../../../src/assets/images/logo.png')

    const takerFileInput = taker.page.locator('input[type="file"]')
    await takerFileInput.setInputFiles(logoPath)
    const makerImage = maker.page.locator('img[alt="Message Image"]').first()
    await expect(makerImage).toBeVisible()

    const makerFileInput = maker.page.locator('input[type="file"]')
    await makerFileInput.setInputFiles(logoPath)
    const takerImages = taker.page.locator('img[alt="Message Image"]')
    await expect(takerImages).toHaveCount(2)
  })
})
