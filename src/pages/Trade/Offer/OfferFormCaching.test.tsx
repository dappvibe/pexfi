import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import OfferForm from '@/pages/Trade/Offer/OfferForm'

// Mock Hooks
// Mock useInventory
const mockInventory = {
  tokens: {
    '0xTokenAddress': {
      address: '0xTokenAddress',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    '0xWETHAddress': {
      address: '0xWETHAddress',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
    },
  },
  fiats: ['USD', 'EUR'],
  methods: {
    'Bank Transfer': { name: 'Bank Transfer', group: 1 },
  },
}

vi.mock('@/hooks/useInventory', () => ({
  useInventory: vi.fn(() => mockInventory),
}))

// Mock matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const mockGetPrice = vi.fn().mockResolvedValue(50000000000n) // 50000 * 10^6

vi.mock('@/hooks/useContract', () => {
  return {
    useContract: vi.fn(() => ({
      signed: vi.fn(),
      OfferFactory: {},
      Offer: { attach: vi.fn() },
      Market: {
        getPrice: mockGetPrice,
        interface: { parseLog: vi.fn() },
      },
    })),
  }
})

describe('OfferForm Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('caches market rate to avoid redundant network requests', async () => {
    const user = userEvent.setup()
    render(
      <ConfigProvider getPopupContainer={() => document.body}>
        <MemoryRouter>
          <OfferForm />
        </MemoryRouter>
      </ConfigProvider>
    )

    const comboboxes = screen.getAllByRole('combobox')
    const [tokenCombobox, fiatCombobox] = comboboxes

    // 1. Select USDT
    await user.click(tokenCombobox)
    const usdtOption = await screen.findByTitle('USDT')
    await user.click(usdtOption)

    // 2. Select USD
    await user.click(fiatCombobox)
    const usdOption = await screen.findByTitle('USD')
    await user.click(usdOption)

    // Expect getPrice to be called for USDT, USD
    await waitFor(() => {
      expect(mockGetPrice).toHaveBeenCalledWith('USDT', 'USD')
    })
    const callsAfterFirst = mockGetPrice.mock.calls.length
    expect(callsAfterFirst).toBe(1)

    // 3. Select EUR
    await user.click(fiatCombobox)
    const eurOption = await screen.findByTitle('EUR')
    await user.click(eurOption)

    // Expect getPrice to be called for USDT, EUR
    await waitFor(() => {
      expect(mockGetPrice).toHaveBeenCalledWith('USDT', 'EUR')
    })
    const callsAfterSecond = mockGetPrice.mock.calls.length
    expect(callsAfterSecond).toBe(2)

    // 4. Select USD again
    await user.click(fiatCombobox)
    const usdOptionAgain = await screen.findByTitle('USD')
    await user.click(usdOptionAgain)

    // Wait a bit to ensure any potential call would have happened
    await new Promise((r) => setTimeout(r, 100))

    // Expect getPrice NOT to be called again
    expect(mockGetPrice).toHaveBeenCalledTimes(2) // Still 2
  })
})
