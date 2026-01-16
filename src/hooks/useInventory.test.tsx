import { renderHook, waitFor } from '@testing-library/react'
import { useInventory } from '@/hooks/useInventory'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { pad, stringToHex } from 'viem'
import * as wagmi from 'wagmi'

// Mock generated abi
vi.mock('@/wagmi', () => ({
  marketAbi: [],
}))

// Mock addresses
vi.mock('@contracts/addresses.json', () => ({
  default: {
    31337: {
      'Market#Market': '0xMarketAddress',
    },
  },
}))

// Mock wagmi
vi.mock('wagmi', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('wagmi')>()),
    useChainId: () => 31337,
    useReadContracts: vi.fn(),
  }
})

const mockReadContracts = vi.mocked(wagmi.useReadContracts)

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
        mockReadContracts.mockClear()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    it('fetches and transforms inventory data correctly', async () => {
        // Setup Mocks
        const mockTokens = [
            { address: '0xTokenAddress', symbol: 'TEST', name: 'Test Token', decimals: 18n }
        ]
        // USD bytes32
        const mockFiats = [pad(stringToHex('USD'), { size: 32, dir: 'right' })]
        const mockMethods = [
            { name: 'Bank Transfer', group: 1n }
        ]

        mockReadContracts.mockImplementation(({ query }: any) => {
            const rawData = [mockTokens, mockFiats, mockMethods]
            const data = query?.select ? query.select(rawData) : rawData
            return { data, isLoading: false }
        })

        const { result } = renderHook(() => useInventory(), { wrapper })

        // Wait for data to be loaded
        await waitFor(() => expect(result.current.tokens).not.toEqual({}))

        // Validation
        const { tokens, fiats, methods } = result.current

        // Check Tokens
        expect(tokens['TEST']).toBeDefined()
        expect(tokens['TEST'].address).toBe('0xTokenAddress')
        expect(tokens['TEST'].symbol).toBe('TEST')
        expect(tokens['TEST'].decimals).toBe(18n)

        // Check Fiats (decoded)
        expect(fiats).toContain('USD')

        // Check Methods
        expect(methods['Bank Transfer']).toBeDefined()
        expect(methods['Bank Transfer'].group).toBe(1n)
    })

    it('handles empty data gracefully', async () => {
        mockReadContracts.mockImplementation(({ query }: any) => {
            const rawData = [[], [], []]
            const data = query?.select ? query.select(rawData) : rawData
            return { data, isLoading: false }
        })

        const { result } = renderHook(() => useInventory(), { wrapper })

        await waitFor(() => expect(result.current).toBeDefined())

        expect(result.current.tokens).toEqual({})
        expect(result.current.fiats).toEqual([])
        expect(result.current.methods).toEqual({})
    })
})
