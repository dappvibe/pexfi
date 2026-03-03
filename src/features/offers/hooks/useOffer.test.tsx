import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOffer } from '@/features/offers/hooks/useOffer'
import OfferModel from '@/model/Offer'

// Mocking dependencies
vi.mock('@/model/Offer', () => {
  return {
    default: {
      fetch: vi.fn(),
    }
  }
})

const mockMarket = {
  getPrice: vi.fn(),
  token: vi.fn(),
  target: '0xMarket',
}

const mockTokenInstance = {
    allowance: vi.fn(),
}

const mockToken = {
  attach: vi.fn().mockReturnValue(mockTokenInstance),
}

const mockOfferContract = {
    attach: vi.fn(),
}

vi.mock('@/hooks/useContract', () => ({
  useContract: () => ({
    Market: mockMarket,
    Offer: mockOfferContract,
    Token: mockToken,
    signed: vi.fn(),
  }),
}))

vi.mock('wagmi', async () => {
    return {
        useChainId: () => 31337,
        useAccount: () => ({ address: '0xUser', isConnected: true }),
    }
})

describe('useOffer Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch price and allowance', async () => {
        // Setup delays
        const priceDelay = 100
        const allowanceDelay = 100

        // Mock Offer fetch
        const mockOffer = {
            token: '0xToken',
            fiat: 'USD',
            isSell: false,
            setPairPrice: vi.fn(),
            address: '0xOffer'
        }
        // @ts-ignore
        OfferModel.fetch.mockResolvedValue(mockOffer)
        mockOfferContract.attach.mockReturnValue({})

        // Mock Market.getPrice with delay
        mockMarket.getPrice.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, priceDelay))
            return 1000n
        })

        // Mock Market.token
        mockMarket.token.mockResolvedValue(['0xTokenAddress'])

        // Mock Token.allowance with delay
        mockTokenInstance.allowance.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, allowanceDelay))
            return 500n
        })

        const start = Date.now()
        const { result } = renderHook(() => useOffer('0xOffer', { fetchPrice: true, fetchAllowance: true }))

        // Wait for final state
        await waitFor(() => {
            expect(result.current.offer).not.toBeNull()
            // In the component, setAllowance(res). res is 500n.
            expect(result.current.allowance).toBe(500n)
        }, { timeout: 1000 })

        const end = Date.now()
        const duration = end - start

        console.log(`Duration: ${duration}ms`)

        // With parallel implementation, it should take roughly max(priceDelay, allowanceDelay) + overhead.
        // Sequential would be priceDelay + allowanceDelay + overhead.

        // Expectation for parallel: should be significantly less than sequential sum
        expect(duration).toBeLessThan(priceDelay + allowanceDelay - 20)

        // And should be reasonably close to the max delay (allowing for overhead)
        expect(duration).toBeGreaterThanOrEqual(Math.max(priceDelay, allowanceDelay))
    })
})
