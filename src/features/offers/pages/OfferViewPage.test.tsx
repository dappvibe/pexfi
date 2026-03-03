import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import OfferViewPage from '@/features/offers/pages/OfferViewPage'
import { useAccount, usePublicClient } from 'wagmi'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { 
  useReadMarketGetPrice, 
  useReadErc20Allowance,
  useWriteOfferCreateDeal,
  useWriteErc20Approve
} from '@/wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(() => 31337),
  usePublicClient: vi.fn(),
}))

// Mock apollo
vi.mock('@apollo/client', () => ({
  gql: vi.fn((s) => s),
}))

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}))

// Mock wagmi generated hooks
vi.mock('@/wagmi', () => ({
  useReadMarketGetPrice: vi.fn(() => ({ data: undefined })),
  useReadErc20Allowance: vi.fn(() => ({ data: undefined, refetch: vi.fn() })),
  useWriteOfferCreateDeal: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  useWriteErc20Approve: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  useWriteOfferSetRate: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  useWriteOfferSetLimits: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  useWriteOfferSetTerms: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  useWriteOfferSetDisabled: vi.fn(() => ({ writeContractAsync: vi.fn() })),
  marketAbi: [],
}))

// Mock hooks
vi.mock('@/shared/web3', () => ({
  useAddress: vi.fn(() => '0xMarketAddress'),
  useInventory: vi.fn(() => ({ tokens: {}, loading: false })),
}))

// Mock useOfferForm
vi.mock('@/features/offers/hooks/useOfferForm', () => ({
  useOfferForm: vi.fn(() => ({
    form: {},
    tokens: {},
    fiats: [],
    methods: {},
    inventoryLoading: false,
    lockSubmit: false,
    createOffer: vi.fn(),
    fetchRate: vi.fn(),
    previewPrice: vi.fn(),
    handleSetRate: vi.fn(),
    handleSetLimits: vi.fn(),
    handleSetTerms: vi.fn(),
    handleToggleDisabled: vi.fn(),
  })),
}))

// Mock Subcomponents
vi.mock('@/features/offers/components/OfferSubnav', () => ({
  default: () => <div data-testid="subnav">Subnav</div>,
}))
vi.mock('@/features/offers/components/OfferDescription', () => ({
  default: () => <div data-testid="description">Description</div>,
}))

describe('OfferViewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePublicClient).mockReturnValue({
        waitForTransactionReceipt: vi.fn().mockResolvedValue({ logs: [] }),
    } as any)
    // Set default mocks that return objects to prevent destructuring errors
    vi.mocked(useReadMarketGetPrice).mockReturnValue({ data: undefined } as any)
    vi.mocked(useReadErc20Allowance).mockReturnValue({ data: undefined, refetch: vi.fn() } as any)
  })

  const renderPage = (offerId = '0x123') => {
    render(
      <MemoryRouter initialEntries={[`/trade/offer/${offerId}`]}>
        <Routes>
          <Route path="/trade/offer/:offerId" element={<OfferViewPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders loading state initially', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
    vi.mocked(useQuery).mockReturnValue({ loading: true, data: null, refetch: vi.fn() } as any)

    renderPage()
    expect(document.querySelector('.ant-skeleton')).toBeDefined()
  })

  it('renders offer details when loaded', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      data: {
        offer: {
          id: '0x123',
          owner: '0xOtherOwner',
          isSell: true,
          token: { id: 'TST', symbol: 'TST', address: '0xToken', decimals: 18, name: 'Test' },
          fiat: 'USD',
          methods: '1',
          rate: 10000,
          minFiat: 10,
          maxFiat: 100,
          terms: 'Terms',
          disabled: false,
        }
      }
    } as any)
    vi.mocked(useReadMarketGetPrice).mockReturnValue({ data: 1000000n } as any) // $10
    vi.mocked(useReadErc20Allowance).mockReturnValue({ data: 0n, refetch: vi.fn() } as any)

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('subnav')).toBeDefined()
      expect(screen.getByTestId('description')).toBeDefined()
      expect(screen.getByText(/You are buying TST for USD/)).toBeDefined()
    })
  })

  it('handles deal creation (fill form and submit)', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      data: {
        offer: {
          id: '0xOfferAddr',
          owner: '0xOtherOwner',
          isSell: true,
          token: { id: 'TST', symbol: 'TST', address: '0xToken', decimals: 18, name: 'Test' },
          fiat: 'USD',
          methods: '1',
          rate: 10000,
          minFiat: 10,
          maxFiat: 100,
          terms: 'Terms',
          disabled: false,
        }
      }
    } as any)
    vi.mocked(useReadMarketGetPrice).mockReturnValue({ data: 2000000n } as any) // $20
    vi.mocked(useReadErc20Allowance).mockReturnValue({ data: 1000000n, refetch: vi.fn() } as any)

    const mockCreateDeal = vi.fn().mockResolvedValue('0xHash')
    vi.mocked(useWriteOfferCreateDeal).mockReturnValue({ writeContractAsync: mockCreateDeal } as any)

    renderPage('0xOfferAddr')

    await waitFor(() => screen.getByPlaceholderText('Fiat Amount'))

    const fiatInput = screen.getByPlaceholderText('Fiat Amount')
    fireEvent.change(fiatInput, { target: { value: '20' } }) // 20 USD

    await waitFor(() => {
      const finalInput = screen.getByPlaceholderText('Crypto Amount') as HTMLInputElement
      expect(finalInput.value).toBe('10.00000000')
    })

    const submitBtn = screen.getByText('Open Deal')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockCreateDeal).toHaveBeenCalled()
    })
  })
})
