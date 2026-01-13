import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DealPage, { useDealContext } from '@/pages/Trade/Deal/Deal'
import { DealState } from '@/wagmi/contracts/useDeal'

vi.mock('@/wagmi/contracts/useDeal', () => ({
  useDeal: vi.fn(),
  DealState: {
    Created: 0,
    Accepted: 1,
    Funded: 2,
    Paid: 3,
    Disputed: 4,
    Cancelled: 5,
    Resolved: 6,
    Released: 7,
  },
}))

vi.mock('@/wagmi/contracts/useOffer', () => ({
  useOffer: vi.fn(() => ({ offer: null, isLoading: false })),
}))

vi.mock('@/wagmi/contracts/useProfile', () => ({
  useProfile: vi.fn(() => ({ profile: null, isLoading: false })),
}))

vi.mock('@/pages/Trade/Deal/DealCard', () => ({
  default: () => {
    const ctx = useDealContext()
    if (!ctx.deal) return <div>No Deal Data</div>
    return (
      <div data-testid="deal-card">
        <span data-testid="deal-state">{ctx.deal.state}</span>
        <span data-testid="deal-fiat">{ctx.deal.fiatAmountFormatted}</span>
        <span data-testid="deal-token">{Number(ctx.deal.tokenAmount)}</span>
        <span data-testid="cancel-unaccepted">{ctx.deal.allowCancelUnacceptedAfter?.toISOString()}</span>
      </div>
    )
  },
}))

vi.mock('@/pages/Trade/Deal/MessageBox', () => ({
  default: () => <div data-testid="message-box">Message Box</div>,
}))

import { useDeal } from '@/wagmi/contracts/useDeal'

describe('DealPage', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeleton when deal data is missing', () => {
    ;(useDeal as any).mockReturnValue({
      deal: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/trade/deal/0x123']}>
        <Routes>
          <Route path="/trade/deal/:dealId" element={<DealPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(container.querySelector('.ant-skeleton')).not.toBeNull()
    expect(screen.queryByTestId('deal-card')).toBeNull()
  })

  it('renders deal data correctly', async () => {
    const mockDeal = {
      address: '0x123' as `0x${string}`,
      state: DealState.Created,
      offer: '0xoffer' as `0x${string}`,
      taker: '0xtaker' as `0x${string}`,
      tokenAmount: 1000000000000000000n,
      tokenAmountFormatted: 1,
      fiatAmount: 100000000n,
      fiatAmountFormatted: 100,
      terms: 'Test terms',
      paymentInstructions: 'Bank transfer',
      allowCancelUnacceptedAfter: new Date('2024-01-01T00:00:00Z'),
      allowCancelUnpaidAfter: new Date('2024-01-02T00:00:00Z'),
      feedbackForOwner: null,
      feedbackForTaker: null,
      messages: [],
      isFinal: false,
      canCancelUnaccepted: false,
      canCancelUnpaid: false,
    }

    ;(useDeal as any).mockReturnValue({
      deal: mockDeal,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    })

    render(
      <MemoryRouter initialEntries={['/trade/deal/0x123']}>
        <Routes>
          <Route path="/trade/deal/:dealId" element={<DealPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByTestId('deal-card')).not.toBeNull()
    })

    expect(screen.getByTestId('deal-state').textContent).toBe('0')
    expect(screen.getByTestId('deal-fiat').textContent).toBe('100')
    expect(screen.getByTestId('cancel-unaccepted').textContent).toBe('2024-01-01T00:00:00.000Z')
  })

  it('handles fetch errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(useDeal as any).mockReturnValue({
      deal: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    })

    render(
      <MemoryRouter initialEntries={['/trade/deal/0x123']}>
        <Routes>
          <Route path="/trade/deal/:dealId" element={<DealPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    consoleSpy.mockRestore()
  })
})
