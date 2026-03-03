import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '@/features/profile/pages/ProfilePage'
import { useProfilePage } from '@/features/profile/hooks/useProfilePage'

vi.mock('@/features/profile/hooks/useProfilePage', () => ({
  useProfilePage: vi.fn(),
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Mint" when user has no profile token', () => {
    vi.mocked(useProfilePage).mockReturnValue({
      address: '0xAlice',
      tokenId: null,
      stats: null,
      isOwnProfile: true,
      create: vi.fn(),
      rating: vi.fn(() => '-'),
    })

    render(<ProfilePage />)

    expect(screen.getByText('You do not have a profile token yet.')).toBeDefined()
    expect(screen.getByText('Mint')).toBeDefined()
  })

  it('renders "no profile" result for external address', () => {
    vi.mocked(useProfilePage).mockReturnValue({
      address: '0xBob',
      tokenId: null,
      stats: null,
      isOwnProfile: false,
      create: vi.fn(),
      rating: vi.fn(() => '-'),
    })

    render(<ProfilePage />)

    expect(screen.getByText('This address does not have a profile token.')).toBeDefined()
  })

  it('renders stats when profile token exists', () => {
    vi.mocked(useProfilePage).mockReturnValue({
      address: '0xAlice',
      tokenId: 123,
      stats: {
        createdAt: new Date('2023-01-01T00:00:00Z'),
        upvotes: 10,
        downvotes: 1,
        volumeUSD: 1000,
        dealsCompleted: 5,
        dealsExpired: 0,
        disputesLost: 0,
        avgPaymentTime: 30,
        avgReleaseTime: 60,
      },
      isOwnProfile: true,
      create: vi.fn(),
      rating: vi.fn(() => '90.91%'),
    })

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText('Profile token ID: 123')).toBeDefined()
    expect(screen.getByText('Deals completed')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('90.91%')).toBeDefined()
  })

  it('calls create on Mint click', async () => {
    const mockCreate = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useProfilePage).mockReturnValue({
      address: '0xAlice',
      tokenId: null,
      stats: null,
      isOwnProfile: true,
      create: mockCreate,
      rating: vi.fn(() => '-'),
    })

    render(<ProfilePage />)
    fireEvent.click(screen.getByText('Mint'))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
    })
  })
})
