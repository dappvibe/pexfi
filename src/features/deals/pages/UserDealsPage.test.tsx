import { render, screen, waitFor } from '@testing-library/react'
import UserDealsPage from '@/features/deals/pages/UserDealsPage'
import { MemoryRouter } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('@/features/deals/hooks/useUserDeals', () => ({
  useUserDeals: vi.fn(),
}))

describe('UserDealsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
  })

  it('renders skeleton while loading', () => {
    vi.mocked(useUserDeals).mockReturnValue({ deals: undefined })

    const { container } = render(
      <MemoryRouter>
        <UserDealsPage />
      </MemoryRouter>
    )

    expect(container.querySelector('.ant-skeleton')).not.toBeNull()
  })

  it('renders empty state when no deals', async () => {
    vi.mocked(useUserDeals).mockReturnValue({ deals: [] })

    render(
      <MemoryRouter>
        <UserDealsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/No data/i).length).toBeGreaterThan(0)
    })
  })

  it('renders list of deals', async () => {
    const mockDeals = [
      {
        contract: { target: '0xDeal1' },
        seller: '0xOther',
        tokenAmount: 1,
        fiatAmount: 100,
        state: 0,
        offer: { token: 'WETH', fiat: 'USD', method: 'Bank' },
        createdAt: { timestamp: 1000 },
      },
    ]
    vi.mocked(useUserDeals).mockReturnValue({ deals: mockDeals })

    render(
      <MemoryRouter>
        <UserDealsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Created:/)).toBeDefined()
      expect(screen.getByText(/Buy 1 WETH for 100 USD with Bank/)).toBeDefined()
    })
  })
})
