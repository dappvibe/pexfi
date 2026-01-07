import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDeal } from '@/hooks/useDeal'

// Mock useQuery directly
const mockUseQuery = vi.fn()
vi.mock('@apollo/client/react', () => ({
    useQuery: (...args) => mockUseQuery(...args)
}))

const mockDealData = {
    id: '0x123',
    state: '1',
    createdAt: 1234567890,
    allowCancelUnacceptedAfter: 123,
    allowCancelUnpaidAfter: 456,
    offer: {
      id: 'offer-1',
      owner: '0xOwner',
      isSell: true,
      token: { id: 't1', address: '0xToken', name: 'Token', decimals: 18 },
      fiat: 'USD',
      method: 'Bank',
      rate: 100,
      minFiat: 10,
      maxFiat: 1000,
      terms: 'terms',
      disabled: false,
    },
    taker: '0xTaker',
    tokenAmount: 100,
    fiatAmount: 10000,
    terms: 'deal terms',
    paymentInstructions: 'pay here',
    messages: [],
    feedbackForOwner: null,
    feedbackForTaker: null,
}

describe('useDeal', () => {

    it('fetches deal data successfully', () => {
        // Mock successful return
        mockUseQuery.mockReturnValue({
            data: { deal: mockDealData },
            loading: false,
            error: undefined,
            refetch: vi.fn(),
        })

        const { result } = renderHook(() => useDeal('0x123'))

        expect(result.current.loading).toBe(false)
        expect(result.current.deal).toEqual(mockDealData)
    })

    it('handles loading state', () => {
        // Mock loading
        mockUseQuery.mockReturnValue({
            data: undefined,
            loading: true,
            error: undefined,
            refetch: vi.fn()
        })

        const { result } = renderHook(() => useDeal('0x999'))
        expect(result.current.loading).toBe(true)
        expect(result.current.deal).toBeUndefined()
    })
})
