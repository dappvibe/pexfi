import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import OfferPage from '@/pages/Trade/Offer/Offer'
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

// Mock models
vi.mock('@/model/Offer.js', () => ({
  default: {
    fetch: vi.fn(),
  },
}))

// Mock Subnav and Description to simplify testing
vi.mock('@/pages/Trade/Offer/Subnav', () => ({
  default: () => <div data-testid="subnav">Subnav</div>,
}))
vi.mock('@/pages/Trade/Offer/Description', () => ({
  default: () => <div data-testid="description">Description</div>,
}))

describe('OfferPage', () => {
  const mockMarket = {
    getPrice: vi.fn().mockResolvedValue(100n), // 100 wei price? or scaled?
    token: vi.fn().mockResolvedValue(['0xTokenAddr']),
    target: '0xMarket',
    interface: {
      parseLog: vi.fn(),
    },
  }
  const mockOfferContract = { attach: vi.fn() }
  const mockTokenContract = {
    attach: vi.fn(),
    allowance: vi.fn(),
  }
  const mockDealFactory = { address: '0xDealFactory' }
  const mockSigned = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useContract).mockReturnValue({
      Market: mockMarket,
      Offer: mockOfferContract,
      Token: mockTokenContract,
      DealFactory: mockDealFactory,
      signed: mockSigned,
    } as any)
  })

  const renderPage = (offerId = '0x123') => {
    render(
      <MemoryRouter initialEntries={[`/trade/offer/${offerId}`]}>
        <Routes>
          <Route path="/trade/offer/:offerId" element={<OfferPage />} />
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
      price: 2, // 1 TST = 2 USD
      min: 10,
      max: 100,
      isSell: true, // Alice Selling TST, User Buying TST (User sends Fiat)
      method: 'Bank',
      setPairPrice: vi.fn(),
    }
    mockOffer.setPairPrice.mockImplementation(() => mockOffer)
    vi.mocked(Offer.fetch).mockResolvedValue(mockOffer as any)

    // Mock Factory create
    const mockFactoryInstance = {
      create: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({ logs: [] }),
      }),
    }
    mockSigned.mockResolvedValue(mockFactoryInstance)

    renderPage()

    await waitFor(() => screen.getByPlaceholderText('Fiat Amount'))

    // Input Fiat Amount
    const fiatInput = screen.getByPlaceholderText('Fiat Amount')
    fireEvent.change(fiatInput, { target: { value: '20' } }) // 20 USD

    // Check Token Amount Sync (20 USD / 2 = 10 TST)
    await waitFor(() => {
      const finalInput = screen.getByPlaceholderText('Crypto Amount') as HTMLInputElement
      expect(finalInput.value).toBe('10.00000000')
    })

    // Submit
    const submitBtn = screen.getByText('Open Deal')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockFactoryInstance.create).toHaveBeenCalled()
    })
  })
})
