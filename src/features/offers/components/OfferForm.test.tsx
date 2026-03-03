import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import OfferForm from '@/features/offers/components/OfferForm'

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

const mockSetRate = vi.fn().mockResolvedValue(undefined)
const mockSetLimits = vi.fn().mockResolvedValue(undefined)
const mockSetTerms = vi.fn().mockResolvedValue(undefined)
const mockToggleDisabled = vi.fn().mockResolvedValue(undefined)
const mockOnFinish = vi.fn().mockResolvedValue(undefined)
const mockFetchRate = vi.fn()
const mockPreviewPrice = vi.fn()

const mockTokens = {
  USDT: { address: '0xTokenAddress', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  WETH: { address: '0xWETHAddress', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
}
const mockFiats = {
  USD: { id: '0x5553440000000000000000000000000000000000000000000000000000000000', symbol: 'USD' },
  EUR: { id: '0x4555520000000000000000000000000000000000000000000000000000000000', symbol: 'EUR' },
  GBP: { id: '0x4742500000000000000000000000000000000000000000000000000000000000', symbol: 'GBP' },
}
const mockMethods = {
  'Bank Transfer': { name: 'Bank Transfer', group: 1, index: 0 },
  Paypal: { name: 'Paypal', group: 2, index: 1 },
}

describe('OfferForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('New Offer Mode', () => {
    it('renders all fields enabled and calls createOffer on submit', async () => {
      const user = userEvent.setup()
      const { Form } = await import('antd')
      const Wrapper = () => {
        const [form] = Form.useForm()
        return (
          <ConfigProvider getPopupContainer={() => document.body}>
            <MemoryRouter>
              <OfferForm
                form={form}
                tokens={mockTokens}
                fiats={mockFiats}
                methods={mockMethods}
                lockSubmit={false}
                createOffer={mockOnFinish}
                fetchRate={mockFetchRate}
                previewPrice={mockPreviewPrice}
              />
            </MemoryRouter>
          </ConfigProvider>
        )
      }

      render(<Wrapper />)

      expect(screen.getByLabelText('token')).toBeEnabled()
      expect(screen.getByLabelText('for')).toBeEnabled()
      expect(screen.getByLabelText('using')).toBeEnabled()
      expect(screen.getByText('Deploy contract')).toBeDefined()
      expect(screen.queryByText('Update')).toBeNull()
    })
  })

  describe('Edit Offer Mode', () => {
    const mockOffer = {
      address: '0xOfferAddress',
      isSell: true,
      token: { symbol: 'WETH' },
      fiat: 'EUR',
      method: 'Paypal',
      rate: 1.05,
      min: 500,
      max: 5000,
      terms: 'No refunds',
      disabled: false,
    }

    it('renders with disabled core fields and Update buttons', async () => {
      const { Form } = await import('antd')
      const Wrapper = () => {
        const [form] = Form.useForm()
        return (
          <MemoryRouter>
            <OfferForm
              offer={mockOffer}
              form={form}
              tokens={mockTokens}
              fiats={mockFiats}
              methods={mockMethods}
              lockSubmit={false}
              createOffer={mockOnFinish}
              fetchRate={mockFetchRate}
              previewPrice={mockPreviewPrice}
              handleSetRate={mockSetRate}
              handleSetLimits={mockSetLimits}
              handleSetTerms={mockSetTerms}
              handleToggleDisabled={mockToggleDisabled}
            />
          </MemoryRouter>
        )
      }

      render(<Wrapper />)

      expect(screen.getByText('WETH')).toBeInTheDocument()
      expect(screen.queryByText('Deploy contract')).toBeNull()
      expect(screen.getByLabelText('token')).toBeDisabled()
      expect(screen.getAllByText('Update').length).toBe(3)
    })

    it('calls handleSetRate on Update click', async () => {
      const user = userEvent.setup()
      const { Form } = await import('antd')
      const Wrapper = () => {
        const [form] = Form.useForm()
        return (
          <MemoryRouter>
            <OfferForm
              offer={mockOffer}
              form={form}
              tokens={mockTokens}
              fiats={mockFiats}
              methods={mockMethods}
              lockSubmit={false}
              createOffer={mockOnFinish}
              fetchRate={mockFetchRate}
              previewPrice={mockPreviewPrice}
              handleSetRate={mockSetRate}
              handleSetLimits={mockSetLimits}
              handleSetTerms={mockSetTerms}
              handleToggleDisabled={mockToggleDisabled}
            />
          </MemoryRouter>
        )
      }

      render(<Wrapper />)
      await user.click(screen.getAllByText('Update')[0])

      await waitFor(() => {
        expect(mockSetRate).toHaveBeenCalled()
      })
    })

    it('calls handleToggleDisabled on Disable click', async () => {
      const user = userEvent.setup()
      const { Form } = await import('antd')
      const Wrapper = () => {
        const [form] = Form.useForm()
        return (
          <MemoryRouter>
            <OfferForm
              offer={mockOffer}
              form={form}
              tokens={mockTokens}
              fiats={mockFiats}
              methods={mockMethods}
              lockSubmit={false}
              createOffer={mockOnFinish}
              fetchRate={mockFetchRate}
              previewPrice={mockPreviewPrice}
              handleSetRate={mockSetRate}
              handleSetLimits={mockSetLimits}
              handleSetTerms={mockSetTerms}
              handleToggleDisabled={mockToggleDisabled}
            />
          </MemoryRouter>
        )
      }

      render(<Wrapper />)
      await user.click(screen.getByText('Disable'))

      await waitFor(() => {
        expect(mockToggleDisabled).toHaveBeenCalled()
      })
    })
  })
})
