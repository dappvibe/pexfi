import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useQueryOffers } from '@/features/offers/hooks/useQueryOffers'
import { useParams } from 'react-router-dom'
import { useAddress, useInventory } from '@/shared/web3'
import { useReadMarketGetPrice } from '@/wagmi'

// Mock third-party hooks
vi.mock('wagmi', () => ({
  useChainId: vi.fn(() => 31337),
}))

vi.mock('@/wagmi', () => ({
  useReadMarketGetPrice: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}))

// Mock custom hooks
vi.mock('@/shared/web3', () => ({
  useAddress: vi.fn(),
  useInventory: vi.fn(),
}))

vi.mock('@/features/offers/hooks/useQueryOffers', () => ({
  useQueryOffers: vi.fn(),
}))

// Mock Subcomponents
vi.mock('@/features/offers/components/OffersTable', () => ({
  default: ({ offers, loading }) => (
    <div data-testid="offers-table">
      Table: {offers.length} offers. Loading: {loading.toString()}
      {offers.map((o) => (
        <div key={o.id} data-testid="offer-item">
          {o.price}
        </div>
      ))}
    </div>
  ),
}))
vi.mock('@/features/offers/components/OffersFilters', () => ({
  default: () => <div data-testid="offers-filters">Filters</div>,
}))
vi.mock('@/features/offers/components/TokenNav', () => ({
  default: () => <div data-testid="token-nav">TokenNav</div>,
}))

describe('OffersListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAddress).mockReturnValue('0xMarketAddress')
    vi.mocked(useParams).mockReturnValue({ side: 'buy', token: 'WETH', fiat: 'USD' })
    vi.mocked(useInventory).mockReturnValue({
      tokens: { WETH: { id: '0xWETHAddress', address: '0xWETHAddress' } },
      fiats: { USD: { id: '0x5553440000000000000000000000000000000000000000000000000000000000', symbol: 'USD' } },
      methods: {},
      loading: false,
      error: undefined,
    } as any)
  })

  it('renders subcomponents and calculates prices', async () => {
    // Mock Offers Data
    const rawOffers = [
      { id: '1', rate: 10000, minFiat: 10, maxFiat: 100, fiat: '0x555344' }, // Rate 1.0 (with 4 decimals)
    ]
    vi.mocked(useQueryOffers).mockReturnValue({
      offers: rawOffers,
      totalCount: 1,
      loadMore: vi.fn(),
      refetch: vi.fn(),
      loading: false,
      error: null,
    } as any)

    // Mock Market Price Query
    vi.mocked(useReadMarketGetPrice).mockReturnValue({
      data: 1, // 1 USD (after select)
      isLoading: false,
    } as any)

    render(<OffersListPage />)

    // Check Layout
    expect(screen.getByTestId('token-nav')).toBeDefined()
    expect(screen.getByTestId('offers-filters')).toBeDefined()
    expect(screen.getByTestId('offers-table')).toBeDefined()

    // rawRate = 10000 -> 1.0 | marketPrice = 1.0 | calculatedPrice = 1.0 * 1.0 = 1.00
    await waitFor(() => {
      expect(screen.getByText('Table: 1 offers. Loading: false')).toBeDefined()
      expect(screen.getByText('1.00')).toBeDefined()
    })
  })

  it('handles loading state', async () => {
    vi.mocked(useQueryOffers).mockReturnValue({
      offers: [],
      loading: true,
      refetch: vi.fn(),
    } as any)

    vi.mocked(useReadMarketGetPrice).mockReturnValue({
      data: null,
      isLoading: true,
    } as any)

    render(<OffersListPage />)

    expect(screen.getByText(/Loading: true/)).toBeDefined()
  })
})
