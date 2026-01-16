import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import WalletMenu from '@/components/WalletMenu'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

// Mock wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
}))

// Mock react-router
vi.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}))

// Mock formatAddress
vi.mock('@/utils', () => ({
  formatAddress: (addr: string) => `formatted-${addr}`,
}))

// Mock matchMedia for Antd
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    }
  }

describe('WalletMenu', () => {
  const mockConnect = vi.fn()
  const mockDisconnect = vi.fn()
  const mockConnectors = [
    { uid: 'meta', name: 'MetaMask' },
    { uid: 'wc', name: 'WalletConnect' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useConnect).mockReturnValue({
      connect: mockConnect,
      connectors: mockConnectors,
    } as any)
    vi.mocked(useDisconnect).mockReturnValue({ disconnect: mockDisconnect } as any)
  })

  it('shows Connect Wallet button when disconnected', () => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined } as any)

    render(<WalletMenu />)

    expect(screen.getByText('Connect Wallet')).toBeDefined()
  })

  it('opens modal and connects on click', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: undefined } as any)
    render(<WalletMenu />)

    // Open Modal
    fireEvent.click(screen.getByText('Connect Wallet'))

    // Check for connectors
    const metaBtn = screen.getByText('MetaMask')
    expect(metaBtn).toBeDefined()

    // Click connector
    fireEvent.click(metaBtn)

    expect(mockConnect).toHaveBeenCalledWith({ connector: mockConnectors[0] })
  })

  it('shows user menu when connected', async () => {
    vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)

    render(<WalletMenu />)

    // Menu item text might be hidden or shown.
    // Antd Menu behavior: checks <b>formatted-0xAlice</b>
    expect(screen.getByText('formatted-0xAlice')).toBeDefined()
  })

  // Antd Menu interactions are complex to test in JSDOM due to hover/portals.
  // We mainly verify the connected state rendering.
})
