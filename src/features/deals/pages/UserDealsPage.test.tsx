import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
    vi.mocked(useUserDeals).mockReturnValue({ deals: undefined } as any)

    const { container } = render(
      <MemoryRouter>
        <UserDealsPage />
      </MemoryRouter>
    )

    expect(container.querySelector('.ant-skeleton')).not.toBeNull()
  })

  it('renders empty state when no deals', async () => {
    vi.mocked(useUserDeals).mockReturnValue({ deals: [] } as any)

    render(
      <MemoryRouter>
        <UserDealsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      // AntD Empty component text can appear multiple times (title, description)
      expect(screen.queryAllByText(/No Data/i).length).toBeGreaterThan(0)
    })
  })

  it('renders list of deals', async () => {
    const mockDeals = [
      {
        id: '0xDeal1',
        taker: '0xAlice',
        tokenAmountFormatted: 1,
        fiatAmountFormatted: 100,
        state: 0,
        offer: { 
          owner: '0xOther',
          isSell: true, // Alice is taker, offer is sell -> Alice is buying
          token: { symbol: 'WETH' }, 
          fiat: 'USD', 
          method: 'Bank' 
        },
        createdAt: 1000,
      },
    ]
    vi.mocked(useUserDeals).mockReturnValue({ deals: mockDeals } as any)

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
