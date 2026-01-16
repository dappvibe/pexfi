import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import OffersTable from '@/pages/Trade/Offers/OffersTable'
import { Providers } from '@/Providers'

import { useAccount } from 'wagmi'

// Mock useParams by rendering inside a Route
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: vi.fn(() => ({
      side: 'sell',
      token: 'WBTC',
      fiat: 'USD',
      method: null,
    })),
  }
})

describe('OffersTable', () => {
  const mockOffers = [
    {
      id: '1',
      isSell: true,
      price: 50000000000n, // 50000.00 * 10^6
      minFiat: 100,
      maxFiat: 1000,
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat Account #0
      profile: { dealsCompleted: 10, rating: 95 },
      method: 'Bank Transfer',
    },
    {
      id: '2',
      isSell: false, // Buy offer
      price: 49000000000n, // 49000.00
      minFiat: 500,
      maxFiat: 5000,
      owner: '0xOtherUser',
      profile: { dealsCompleted: 5, rating: 80 },
      method: 'Paypal',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: Connected as Owner of offer 1
    // @ts-ignore
    useAccount.mockReturnValue({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      isConnected: true,
    })
  })

  it('renders empty state', () => {
    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={[]} loading={false} loadMore={vi.fn()} totalOffers={0} />
        </MemoryRouter>
      </Providers>
    )
    expect(screen.getAllByText('No data').length).toBeGreaterThan(0)

    expect(screen.getByText('Price')).not.toBeNull()
    expect(screen.getByText('User')).not.toBeNull()
  })

  it('renders offers with correct data', () => {
    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={mockOffers} loading={false} loadMore={vi.fn()} totalOffers={2} />
        </MemoryRouter>
      </Providers>
    )

    // Offer 1 Owner is current user -> Should see "Edit"
    const editButtons = screen.getAllByText('Edit')
    expect(editButtons.length).toBeGreaterThan(0)

    // Offer 2 Owner is other -> Should see "Sell"
    expect(screen.getByText('Sell')).not.toBeNull()
  })

  it('shows Edit button for own offers', () => {
    // Connected as 0xf39... matches Offer 1
    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={[mockOffers[0]]} loading={false} loadMore={vi.fn()} totalOffers={1} />
        </MemoryRouter>
      </Providers>
    )
    expect(screen.getByText('Edit')).not.toBeNull()
    expect(screen.queryByText('Buy')).toBeNull()
  })

  it('shows Buy/Sell button for other offers', () => {
    // Connected as 0xOtherUser
    // @ts-ignore
    useAccount.mockReturnValue({
      address: '0xSomeoneElse',
      isConnected: true,
    })

    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={mockOffers} loading={false} loadMore={vi.fn()} totalOffers={2} />
        </MemoryRouter>
      </Providers>
    )

    // Offer 1 (isSell=true) -> I can 'Buy'
    expect(screen.getByText('Buy')).not.toBeNull()

    // Offer 2 (isSell=false) -> I can 'Sell'
    expect(screen.getByText('Sell')).not.toBeNull()

    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('renders Load More button when applicable', () => {
    const loadMore = vi.fn()
    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={mockOffers} loading={false} loadMore={loadMore} totalOffers={null} />
        </MemoryRouter>
      </Providers>
    )

    const btn = screen.getByText('Load more...')
    fireEvent.click(btn)
    expect(loadMore).toHaveBeenCalled()
  })

  it('shows "Shown all N offers" when end reached', () => {
    render(
      <Providers>
        <MemoryRouter>
          <OffersTable offers={mockOffers} loading={false} loadMore={vi.fn()} totalOffers={2} />
        </MemoryRouter>
      </Providers>
    )
    expect(screen.getByText('Shown all 2 offers')).not.toBeNull()
    expect(screen.queryByText('Load more...')).toBeNull()
  })
})
