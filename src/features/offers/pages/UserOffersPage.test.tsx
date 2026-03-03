import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserOffersPage from '@/features/offers/pages/UserOffersPage'
import { useAccount } from 'wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock OffersListPage to verify it receives correct filter
vi.mock('@/features/offers/pages/OffersListPage', () => ({
  default: ({ filter }) => <div data-testid="offers-list">{JSON.stringify(filter)}</div>,
}))

describe('UserOffersPage', () => {
  it('renders OffersListPage with user address filter', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

    render(<UserOffersPage />)

    const offersList = screen.getByTestId('offers-list')
    expect(offersList).toBeDefined()
    expect(offersList.textContent).toContain('"owner":"0xAlice"')
  })
})
