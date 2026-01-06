import { render, screen, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DealPage, { useDealContext } from '@/pages/Trade/Deal/Deal.tsx'
import { useDeal } from '@/hooks/useDeal'
import { useContract } from '@/hooks/useContract'

// Mock Hooks
vi.mock('@/hooks/useDeal', () => ({
    useDeal: vi.fn()
}))

vi.mock('@/hooks/useContract', () => ({
    useContract: vi.fn()
}))

vi.mock('wagmi', () => ({
    useChainId: vi.fn(() => 1),
    useWatchContractEvent: vi.fn()
}))

// Mock Child Components to verify Context
vi.mock('@/pages/Trade/Deal/DealCard', () => ({
    default: () => {
        const { deal } = useDealContext()
        if (!deal) return <div>No Deal Data</div>
        return (
            <div data-testid="deal-card">
                <span data-testid="deal-state">{deal.state}</span>
                <span data-testid="deal-fiat">{deal.fiatAmount}</span>
                <span data-testid="deal-token">{deal.tokenAmount}</span>
                <span data-testid="cancel-unaccepted">{deal.allowCancelUnacceptedAfter?.toISOString()}</span>
            </div>
        )
    }
}))

vi.mock('@/pages/Trade/Deal/MessageBox', () => ({
    default: () => <div data-testid="message-box">Message Box</div>
}))

// Mock Date for deterministic tests
const mockDate = new Date('2024-01-01T00:00:00Z')
vi.setSystemTime(mockDate)

describe('DealPage', () => {
    const mockRefetch = vi.fn()
    const mockDealContract = {
        interface: {
            format: vi.fn(),
            parseLog: vi.fn()
        },
        attach: vi.fn(() => ({
            // mock methods if needed by DealPage or children (though children are mocked here)
        }))
    }

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useContract as any).mockReturnValue({
            Deal: mockDealContract
        })
    })

    it('renders loading skeleton when deal data is missing', () => {
        ;(useDeal as any).mockReturnValue({
            deal: null,
            error: null,
            refetch: mockRefetch
        })

        const { container } = render(
            <MemoryRouter initialEntries={['/trade/deal/123']}>
                 <Routes>
                    <Route path="/trade/deal/:dealId" element={<DealPage />} />
                </Routes>
            </MemoryRouter>
        )

        // Antd Skeleton usually has class 'ant-skeleton'
        expect(container.querySelector('.ant-skeleton')).not.toBeNull()
        expect(screen.queryByTestId('deal-card')).toBeNull()
    })

    it('renders deal data correctly after transformation', async () => {
        const rawDeal = {
            id: '0x123',
            state: '0', // Created
            allowCancelUnacceptedAfter: '1704067200', // 2024-01-01T00:00:00.000Z (seconds)
            allowCancelUnpaidAfter: '1704153600',
            fiatAmount: '100000000', // 100 * 10^6 (as string)
            offer: {
                token: {
                    decimals: 18
                }
            },
            tokenAmount: '1000000000000000000', // 1 * 10^18 (as string)
            messages: []
        }

        ;(useDeal as any).mockReturnValue({
            deal: rawDeal,
            error: null,
            refetch: mockRefetch
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

        // Check transformations
        expect(screen.getByTestId('deal-state').textContent).toBe('0')
        expect(screen.getByTestId('deal-fiat').textContent).toBe('100') // 100000000 / 10^6
        expect(screen.getByTestId('deal-token').textContent).toBe('1') // 10^18 / 10^18

        // Date check
        const expectedDate = new Date(1704067200 * 1000).toISOString()
        expect(screen.getByTestId('cancel-unaccepted').textContent).toBe(expectedDate)
    })

     it('handles fetch errors', async () => {
         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
         ;(useDeal as any).mockReturnValue({
            deal: null,
            error: { message: 'Network error' },
            refetch: mockRefetch
        })

        render(
             <MemoryRouter initialEntries={['/trade/deal/0x123']}>
                 <Routes>
                    <Route path="/trade/deal/:dealId" element={<DealPage />} />
                </Routes>
            </MemoryRouter>
        )

        // useEffect calls console.error and message.error
        // We can't easily check message.error (antd static), but we spy console
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Network error')
        })
         consoleSpy.mockRestore()
    })
})
