import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInventory } from '@/hooks/useInventory'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ethers } from 'ethers'

// Mock useContract
const mockGetTokens = vi.fn()
const mockGetFiats = vi.fn()
const mockGetMethods = vi.fn()

vi.mock('@/hooks/useContract', () => ({
  useContract: () => ({
    Market: {
      getTokens: mockGetTokens,
      getFiats: mockGetFiats,
      getMethods: mockGetMethods,
    },
  }),
}))

// Mock wagmi useChainId
vi.mock('wagmi', async (importOriginal) => {
    return {
        ...(await importOriginal<typeof import('wagmi')>()),
        useChainId: () => 31337
    }
})

describe('useInventory', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        })
        mockGetTokens.mockClear()
        mockGetFiats.mockClear()
        mockGetMethods.mockClear()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    it('fetches and transforms inventory data correctly', async () => {
        // Setup Mocks
        const mockTokens = [
            ['0xTokenAddress', 'TEST', 'Test Token', 18n]
        ]
        // USD bytes32
        const mockFiats = [ethers.encodeBytes32String('USD')]
        const mockMethods = [
            ['Bank Transfer', 1n]
        ]

        mockGetTokens.mockResolvedValue(mockTokens)
        mockGetFiats.mockResolvedValue(mockFiats)
        mockGetMethods.mockResolvedValue(mockMethods)

        const { result } = renderHook(() => useInventory(), { wrapper })

        // Wait for data to be loaded
        await waitFor(() => expect(result.current.tokens).not.toEqual({}))

        // Validation
        const { tokens, fiats, methods } = result.current

        // Check Tokens
        expect(tokens['TEST']).toBeDefined()
        expect(tokens['TEST'].address).toBe('0xTokenAddress')
        expect(tokens['TEST'].symbol).toBe('TEST')
        expect(tokens['TEST'].decimals).toBe(18) // Number conversion

        // Check Fiats (decoded)
        expect(fiats).toContain('USD')

        // Check Methods
        expect(methods['Bank Transfer']).toBeDefined()
        expect(methods['Bank Transfer'].group).toBe(1)
    })

    it('handles empty data gracefully', async () => {
        mockGetTokens.mockResolvedValue([])
        mockGetFiats.mockResolvedValue([])
        mockGetMethods.mockResolvedValue([])

        const { result } = renderHook(() => useInventory(), { wrapper })

        await waitFor(() => expect(result.current).toBeDefined())

        expect(result.current.tokens).toEqual({})
        expect(result.current.fiats).toEqual([])
        expect(result.current.methods).toEqual({})
    })
})
