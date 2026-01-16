import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserOffers from '@/pages/Me/Offers/UserOffers'
import { useAccount } from 'wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock Offer list component to verify it receives correct filter
vi.mock('@/pages/Trade/Offers/Offers', () => ({
  default: ({ filter }) => <div data-testid="offers-list">{JSON.stringify(filter)}</div>,
}))

describe('UserOffers', () => {
  it('renders Offers component with user address filter', () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

    render(<UserOffers />)

    const offersList = screen.getByTestId('offers-list')
    expect(offersList).toBeDefined()
    expect(offersList.textContent).toContain('"owner":"0xAlice"')
  })
})
