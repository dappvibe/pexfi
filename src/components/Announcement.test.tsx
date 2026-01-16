import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Announcement } from '@/components/Announcement'
import { useChainId, useChains } from 'wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useChainId: vi.fn(),
  useChains: vi.fn(),
}))

describe('Announcement', () => {
  it('renders MVP welcome message always', () => {
    vi.mocked(useChainId).mockReturnValue(1)
    vi.mocked(useChains).mockReturnValue([])

    render(<Announcement />)
    expect(screen.getByText(/Welcome to Priveer's MVP/)).toBeDefined()
  })

  it('renders testnet alert when on localhost', () => {
    vi.mocked(useChainId).mockReturnValue(31337)
    vi.mocked(useChains).mockReturnValue([])

    render(<Announcement />)
    expect(screen.getByText(/This is a testnet/)).toBeDefined()
  })

  it('renders testnet alert when chain is flagged as testnet', () => {
    vi.mocked(useChainId).mockReturnValue(123)
    vi.mocked(useChains).mockReturnValue([{ id: 123, testnet: true } as any])

    render(<Announcement />)
    expect(screen.getByText(/This is a testnet/)).toBeDefined()
  })

  it('does not render testnet alert on mainnet', () => {
    vi.mocked(useChainId).mockReturnValue(1)
    vi.mocked(useChains).mockReturnValue([{ id: 1, testnet: false } as any])

    render(<Announcement />)
    expect(screen.queryByText(/This is a testnet/)).toBeNull()
  })
})
