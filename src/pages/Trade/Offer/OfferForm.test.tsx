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
  fiats: ['USD', 'EUR', 'GBP'],
  methods: {
    'Bank Transfer': { name: 'Bank Transfer', group: 1 },
    Paypal: { name: 'Paypal', group: 2 },
  },
}

vi.mock('@/hooks/useInventory', () => ({
  useInventory: vi.fn(() => mockInventory),
}))

// Mock matchMedia for Ant Design (required for real components)
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

const mockCreate = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({ logs: [] }) })
const mockSetRate = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetLimits = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetTerms = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetDisabled = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

// Mock Offer Contract Instance
const mockOfferContract = {
  setRate: mockSetRate,
  setLimits: mockSetLimits,
  setTerms: mockSetTerms,
  setDisabled: mockSetDisabled,
  connect: vi.fn().mockReturnThis(),
}

// Mock useContract
const mockOfferFactoryInstance = {
  create: mockCreate,
  connect: vi.fn().mockReturnThis(),
}

vi.mock('@/hooks/useContract', () => {
  return {
    useContract: vi.fn(() => ({
      signed: vi.fn(() => Promise.resolve(mockOfferFactoryInstance)),
      OfferFactory: mockOfferFactoryInstance,
      Offer: {
        attach: vi.fn(() => mockOfferContract),
      },
      Market: {
        getPrice: vi.fn(() => Promise.resolve(50000000000n)), // 50000 * 10^6
        interface: {
          parseLog: vi.fn(),
        },
      },
    })),
  }
})

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  configurable: true,
  value: { reload: vi.fn() },
})

describe('OfferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('New Offer Mode', () => {
    it('renders all fields enabled and submits', async () => {
      const user = userEvent.setup()
      render(
        <ConfigProvider getPopupContainer={() => document.body}>
          <MemoryRouter>
            <OfferForm />
          </MemoryRouter>
        </ConfigProvider>
      )

      // Verify fields are enabled
      expect(screen.getByLabelText('token')).toBeEnabled()
      expect(screen.getByLabelText('for')).toBeEnabled()
      expect(screen.getByLabelText('using')).toBeEnabled()

      await user.click(screen.getByText('Sell'))

      // Get all comboboxes - Ant Design Select with showSearch renders as combobox
      const comboboxes = screen.getAllByRole('combobox')
      // Order: token, fiat, method (based on DOM order)
      const [tokenCombobox, fiatCombobox, methodCombobox] = comboboxes

      // Select Token - type to search, then select from filtered options
      await user.click(tokenCombobox)
      await user.type(tokenCombobox, 'USDT')
      const usdtOption = await screen.findByTitle('USDT')
      await user.click(usdtOption)

      // Select Fiat
      await user.click(fiatCombobox)
      await user.type(fiatCombobox, 'USD')
      const usdOption = await screen.findByTitle('USD')
      await user.click(usdOption)

      // Select Method
      await user.click(methodCombobox)
      await user.type(methodCombobox, 'Bank Transfer')
      const bankOption = await screen.findByTitle('Bank Transfer')
      await user.click(bankOption)

      // Input Margin
      const marginInput = screen.getByLabelText('Margin')
      await user.clear(marginInput)
      await user.type(marginInput, '10')

      // Limits
      await user.type(screen.getByLabelText('Limits'), '100')
      await user.type(screen.getByLabelText('-'), '1000')

      await user.click(screen.getByText('Deploy contract'))

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled()
      })

      const expectedRate = 11000
      expect(mockCreate).toHaveBeenCalledWith(true, 'USDT', 'USD', 'Bank Transfer', expectedRate, [100, 1000], '')
    }, 30000)
  })

  describe('Edit Offer Mode', () => {
    const mockOffer = {
      address: '0xOfferAddress',
      isSell: true,
      token: 'WETH',
      fiat: 'EUR',
      method: 'Paypal',
      rate: 1.05,
      min: 500,
      max: 5000,
      terms: 'No refunds',
      disabled: false,
    }

    const mockSetRate = vi.fn().mockResolvedValue(undefined)
    const mockSetLimits = vi.fn().mockResolvedValue(undefined)
    const mockSetTerms = vi.fn().mockResolvedValue(undefined)
    const mockToggleDisabled = vi.fn().mockResolvedValue(undefined)

    beforeEach(() => {
      mockSetRate.mockClear()
      mockSetLimits.mockClear()
      mockSetTerms.mockClear()
      mockToggleDisabled.mockClear()
    })

    it('renders with populated values and disabled core fields', () => {
      render(
        <MemoryRouter>
          <OfferForm offer={mockOffer} />
        </MemoryRouter>
      )

      expect(screen.getByText('WETH')).toBeInTheDocument()
      expect(screen.getByText('EUR')).not.toBeNull()
      expect(screen.getByDisplayValue('5.00')).not.toBeNull()
      expect(screen.getByDisplayValue('500')).not.toBeNull()
      expect(screen.getByDisplayValue('5000')).not.toBeNull()
      expect(screen.getByDisplayValue('No refunds')).not.toBeNull()

      expect(screen.queryByText('Deploy contract')).toBeNull()
      expect(screen.getByLabelText('token')).toBeDisabled()
    })

    it('updates Rate', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <OfferForm
            offer={mockOffer}
            setRate={mockSetRate}
            setLimits={mockSetLimits}
            setTerms={mockSetTerms}
            toggleDisabled={mockToggleDisabled}
          />
        </MemoryRouter>
      )

      const rateInput = screen.getByLabelText('Margin')
      await user.clear(rateInput)
      await user.type(rateInput, '10')

      const updateBtn = screen.getAllByText('Update')[0]
      await user.click(updateBtn)

      await waitFor(() => {
        expect(mockSetRate).toHaveBeenCalledWith(10)
      })
    })

    it('updates Limits', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <OfferForm
            offer={mockOffer}
            setRate={mockSetRate}
            setLimits={mockSetLimits}
            setTerms={mockSetTerms}
            toggleDisabled={mockToggleDisabled}
          />
        </MemoryRouter>
      )

      const minInput = screen.getByLabelText('Limits')
      await user.clear(minInput)
      await user.type(minInput, '200')

      const updateBtn = screen.getAllByText('Update')[1]
      await user.click(updateBtn)

      await waitFor(() => {
        expect(mockSetLimits).toHaveBeenCalledWith(200, 5000)
      })
    })

    it('updates Terms', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <OfferForm
            offer={mockOffer}
            setRate={mockSetRate}
            setLimits={mockSetLimits}
            setTerms={mockSetTerms}
            toggleDisabled={mockToggleDisabled}
          />
        </MemoryRouter>
      )

      const termsInput = screen.getByLabelText('Terms')
      await user.clear(termsInput)
      await user.type(termsInput, 'New terms')

      const updateBtn = screen.getAllByText('Update')[2]
      await user.click(updateBtn)

      await waitFor(() => {
        expect(mockSetTerms).toHaveBeenCalledWith('New terms')
      })
    })

    it('toggles Disable', async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter>
          <OfferForm
            offer={mockOffer}
            setRate={mockSetRate}
            setLimits={mockSetLimits}
            setTerms={mockSetTerms}
            toggleDisabled={mockToggleDisabled}
          />
        </MemoryRouter>
      )

      const disableBtn = screen.getByText('Disable')
      await user.click(disableBtn)

      await waitFor(() => {
        expect(mockToggleDisabled).toHaveBeenCalled()
      })
    })
  })
})
