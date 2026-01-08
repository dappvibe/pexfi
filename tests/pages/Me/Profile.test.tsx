import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Profile from '@/pages/Me/Profile'
import { useAccount } from 'wagmi'
import { useContract } from '@/hooks/useContract'

// Mock wagmi
vi.mock('wagmi', () => ({
    useAccount: vi.fn(),
}))

// Mock hooks
vi.mock('@/hooks/useContract', () => ({
    useContract: vi.fn(),
}))

// Mock react-router
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(() => ({})),
    Link: ({ to, children }) => <a href={to}>{children}</a>
}))

describe('Profile Page', () => {
    const mockRepToken = {
        ownerToTokenId: vi.fn(),
        stats: vi.fn(),
        register: vi.fn(),
        interface: { parseLog: vi.fn() }
    }
    const mockSigned = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useContract).mockReturnValue({
            RepToken: mockRepToken,
            signed: mockSigned
        } as any)
    })

    it('renders "Mint" when user has no profile token', async () => {
        vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
        mockRepToken.ownerToTokenId.mockResolvedValue(null) // No token

        render(<Profile />)

        await waitFor(() => {
            expect(screen.getByText('You do not have a profile token yet.')).toBeDefined()
            expect(screen.getByText('Mint')).toBeDefined()
        })
    })

    it('renders stats when user has profile token', async () => {
        vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
        mockRepToken.ownerToTokenId.mockResolvedValue(123)
        mockRepToken.stats.mockResolvedValue([
            1672531200, // createdAt (timestamp)
            10, // upvotes
            1, // downvotes
            1000, // volume
            5, // completed
            0, // expired
            0, // disputes
            30, // avg payment
            60 // avg release
        ])

        render(<Profile />)

        await waitFor(() => {
            expect(screen.getByText('Profile token ID: 123')).toBeDefined()
            expect(screen.getByText('Deals completed')).toBeDefined()
            expect(screen.getByText('5')).toBeDefined()
        })
    })

    it('handles minting flow', async () => {
         vi.mocked(useAccount).mockReturnValue({ address: '0xAlice' } as any)
         mockRepToken.ownerToTokenId.mockResolvedValue(null)

         const mockTx = { wait: vi.fn().mockResolvedValue({ logs: [{}] }) }
         const mockRepSigned = { register: vi.fn().mockResolvedValue(mockTx) }
         mockSigned.mockResolvedValue(mockRepSigned)

         // Mock log parsing for new ID
         mockRepToken.interface.parseLog.mockReturnValue({ args: [null, null, 456] }) // args[2] is tokenId
         mockRepToken.stats.mockResolvedValue([0,0,0,0,0,0,0,0,0])

         // Wait for initial render
         render(<Profile />)
         await waitFor(() => expect(screen.getByText('Mint')).toBeDefined())

         // Click Mint
         fireEvent.click(screen.getByText('Mint'))

         await waitFor(() => {
             expect(mockSigned).toHaveBeenCalledWith(mockRepToken)
             expect(mockRepSigned.register).toHaveBeenCalled()
             // Should update to stats view eventually
             expect(screen.getByText('Profile token ID: 456')).toBeDefined()
         })
    })
})
