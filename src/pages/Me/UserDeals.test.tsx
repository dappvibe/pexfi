import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserDeals from '@/pages/Me/UserDeals'
import { MemoryRouter } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useQuery } from '@apollo/client'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock apollo
vi.mock('@apollo/client', () => ({
  gql: vi.fn((q) => q),
  useQuery: vi.fn(),
}))

describe('UserDeals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' })
  })

  it('renders loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined,
    })

    const { container } = render(
      <MemoryRouter>
        <UserDeals />
      </MemoryRouter>
    )
    // Ant Design Skeleton check
    expect(container.querySelector('.ant-skeleton')).toBeInTheDocument()
  })

  it('renders empty state when no deals found', async () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: { asMaker: [], asTaker: [] },
      error: undefined,
    })

    render(
      <MemoryRouter>
        <UserDeals />
      </MemoryRouter>
    )

    await waitFor(() => {
      const elements = screen.getAllByText('No data')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('renders list of deals', async () => {
    const mockDeal = {
      id: '0xDeal1',
      createdAt: 1000,
      state: 0,
      tokenAmount: '1000000000000000000', // 1e18
      fiatAmount: '1000000', // 1e6
      offer: {
        id: '0xOffer1',
        token: {
          id: '0xToken',
          decimals: 18,
          symbol: 'TKN',
        },
        fiat: 'USD',
        method: 'Bank',
        owner: '0xAlice', // Maker is Alice
        isSell: true, // Alice is selling
      },
      taker: '0xBob',
    }

    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: {
        asMaker: [mockDeal],
        asTaker: [],
      },
      error: undefined,
    })

    render(
      <MemoryRouter>
        <UserDeals />
      </MemoryRouter>
    )

    await waitFor(() => {
      // Title logic:
      // isSeller = deal.seller (Alice) === address (Alice) -> true -> "Sell "
      // "Sell " + "1 " + "TKN" + " for " + "1 " + "USD" + " with " + "Bank"
      expect(screen.getByText(/Sell 1 TKN for 1 USD with Bank/)).toBeInTheDocument()
      expect(screen.getByText(/Created:/)).toBeInTheDocument()
    })
  })

  it('renders error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      loading: false,
      data: undefined,
      error: new Error('Failed'),
    })

    render(
      <MemoryRouter>
        <UserDeals />
      </MemoryRouter>
    )

    expect(screen.getByText('Error loading deals')).toBeInTheDocument()
  })
})
