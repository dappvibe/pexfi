import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import OfferViewPage from '@/features/offers/pages/OfferViewPage'
import { useAccount } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Offer from '@/model/Offer.js' // Mocked

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(() => 31337),
  useWaitForTransactionReceipt: vi.fn(),
  useWriteContract: vi.fn(() => ({ writeContractAsync: vi.fn() })),
}))

// Mock hooks
vi.mock('@/hooks/useContract', () => ({
  useContract: vi.fn(),
}))

// Mock useAddress to avoid @/types dependency
vi.mock('@/hooks/useAddress', () => ({
  useAddress: vi.fn(() => '0xMarketAddress'),
}))

// Mock useOfferForm — it depends on wagmi/contract hooks not needed for these tests
vi.mock('@/features/offers/hooks/useOfferForm', () => ({
  useOfferForm: vi.fn(() => ({
    form: {},
    tokens: {},
    fiats: [],
    methods: {},
    inventoryLoading: false,
    lockSubmit: false,
    onFinish: vi.fn(),
    fetchRate: vi.fn(),
    previewPrice: vi.fn(),
    handleSetRate: vi.fn(),
    handleSetLimits: vi.fn(),
    handleSetTerms: vi.fn(),
    handleToggleDisabled: vi.fn(),
  })),
}))

// Mock models
vi.mock('@/model/Offer.js', () => ({
  default: {
    fetch: vi.fn(),
  },
}))

// Mock Subcomponents
vi.mock('@/features/offers/components/OfferSubnav', () => ({
  default: () => <div data-testid="subnav">Subnav</div>,
}))
vi.mock('@/features/offers/components/OfferDescription', () => ({
  default: () => <div data-testid="description">Description</div>,
}))

describe('OfferViewPage', () => {
  const mockMarket = {
    getPrice: vi.fn().mockResolvedValue(100n),
    token: vi.fn().mockResolvedValue(['0xTokenAddr']),
    target: '0xMarket',
    interface: {
      parseLog: vi.fn(),
    },
  }
  const mockOfferContractInstance = {
    createDeal: vi.fn(),
  }
  const mockOfferContract = { attach: vi.fn(() => mockOfferContractInstance) }
  const mockSigned = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useContract).mockReturnValue({
      Market: mockMarket,
      Offer: mockOfferContract,
      Token: { attach: vi.fn(), allowance: vi.fn() },
      signed: mockSigned,
    } as any)
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
    vi.mocked(Offer.fetch).mockReturnValue(new Promise(() => {})) // Never resolves

    renderPage()
    expect(document.querySelector('.ant-skeleton')).toBeDefined()
  })

  it('renders offer details when loaded', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

    const mockOffer = {
      token: 'TST',
      fiat: 'USD',
      price: 10,
      min: 10,
      max: 100,
      isSell: true,
      method: 'Bank',
      owner: '0xOtherOwner',
      setPairPrice: vi.fn(),
    }
    mockOffer.setPairPrice.mockImplementation(() => mockOffer)

    vi.mocked(Offer.fetch).mockResolvedValue(mockOffer as any)

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('subnav')).toBeDefined()
      expect(screen.getByTestId('description')).toBeDefined()
      expect(screen.getByText(/You are buying TST for USD/)).toBeDefined()
    })
  })

  it('handles deal creation (fill form and submit)', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

    const mockOffer = {
      address: '0xOfferAddr',
      token: 'TST',
      fiat: 'USD',
      price: 2,
      min: 10,
      max: 100,
      isSell: true,
      method: 'Bank',
      owner: '0xOtherOwner',
      setPairPrice: vi.fn(),
    }
    mockOffer.setPairPrice.mockImplementation(() => mockOffer)
    vi.mocked(Offer.fetch).mockResolvedValue(mockOffer as any)

    const mockSignedOffer = {
      createDeal: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({ logs: [] }),
      }),
    }
    mockSigned.mockResolvedValue(mockSignedOffer)

    renderPage()

    await waitFor(() => screen.getByPlaceholderText('Fiat Amount'))

    const fiatInput = screen.getByPlaceholderText('Fiat Amount')
    fireEvent.change(fiatInput, { target: { value: '20' } }) // 20 USD

    // Check Token Amount Sync (20 USD / 2 = 10 TST)
    await waitFor(() => {
      const finalInput = screen.getByPlaceholderText('Crypto Amount') as HTMLInputElement
      expect(finalInput.value).toBe('10.00000000')
    })

    const submitBtn = screen.getByText('Open Deal')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockSignedOffer.createDeal).toHaveBeenCalled()
    })
  })
})
