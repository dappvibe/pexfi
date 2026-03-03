import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOffer } from '@/features/offers/hooks/useOffer'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { 
  useReadMarketGetPrice, 
  useReadErc20Allowance,
  useWriteOfferSetRate,
  useWriteOfferSetLimits,
  useWriteOfferSetTerms,
  useWriteOfferSetDisabled
} from '@/wagmi'

// Mocking dependencies
vi.mock('@apollo/client', () => ({
  gql: vi.fn((s) => s),
}))

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}))

vi.mock('@/wagmi', () => ({
  useReadMarketGetPrice: vi.fn(),
  useReadErc20Allowance: vi.fn(),
  useWriteOfferSetRate: vi.fn(),
  useWriteOfferSetLimits: vi.fn(),
  useWriteOfferSetTerms: vi.fn(),
  useWriteOfferSetDisabled: vi.fn(),
}))

vi.mock('@/shared/web3', () => ({
  useAddress: vi.fn(() => '0xMarketAddress'),
}))

vi.mock('wagmi', async () => {
    return {
        useChainId: () => 31337,
        useAccount: () => ({ address: '0xUser', isConnected: true }),
    }
})

describe('useOffer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        
        // Default mock for useQuery (Offer fetch)
        vi.mocked(useQuery).mockReturnValue({
            data: {
                offer: {
                    id: '0xoffer',
                    owner: '0xowner',
                    isSell: false,
                    token: {
                        id: '0xtoken',
                        address: '0xtokenaddress',
                        name: 'Token',
                        symbol: 'TKN',
                        decimals: 18,
                    },
                    fiat: 'USD',
                    methods: '1',
                    rate: 10100, // 1.01
                    minFiat: 100,
                    maxFiat: 1000,
                    terms: 'Terms',
                    disabled: false,
                }
            },
            loading: false,
            error: undefined,
            refetch: vi.fn(),
        } as any)

        // Default mocks for wagmi hooks
        vi.mocked(useReadMarketGetPrice).mockReturnValue({ data: 100000000n } as any) // $1000
        vi.mocked(useReadErc20Allowance).mockReturnValue({ data: 500n, refetch: vi.fn() } as any)
        vi.mocked(useWriteOfferSetRate).mockReturnValue({ writeContractAsync: vi.fn() } as any)
        vi.mocked(useWriteOfferSetLimits).mockReturnValue({ writeContractAsync: vi.fn() } as any)
        vi.mocked(useWriteOfferSetTerms).mockReturnValue({ writeContractAsync: vi.fn() } as any)
        vi.mocked(useWriteOfferSetDisabled).mockReturnValue({ writeContractAsync: vi.fn() } as any)
    })

    it('should fetch offer details and calculate price', async () => {
        const { result } = renderHook(() => useOffer('0xOffer', { fetchPrice: true, fetchAllowance: true }))

        await waitFor(() => {
            expect(result.current.offer).not.toBeNull()
        })

        expect(result.current.offer?.rate).toBe(1.01)
        expect(result.current.offer?.price).toBe('101.000') // basePrice 100 * 1.01
        expect(result.current.allowance).toBe(500n)
    })

    it('should handle write operations using wagmi hooks', async () => {
        const mockSetRate = vi.fn()
        vi.mocked(useWriteOfferSetRate).mockReturnValue({ writeContractAsync: mockSetRate } as any)

        const { result } = renderHook(() => useOffer('0xOffer'))

        await act(async () => {
            await result.current.setRate(1.05)
        })

        expect(mockSetRate).toHaveBeenCalledWith({
            address: '0xOffer',
            args: [10500],
        })
    })

    it('should toggle disabled state', async () => {
        const mockSetDisabled = vi.fn()
        vi.mocked(useWriteOfferSetDisabled).mockReturnValue({ writeContractAsync: mockSetDisabled } as any)

        const { result } = renderHook(() => useOffer('0xOffer'))

        await act(async () => {
            await result.current.toggleDisabled()
        })

        expect(mockSetDisabled).toHaveBeenCalledWith({
            address: '0xOffer',
            args: [true], // toggled from false
        })
    })
})
