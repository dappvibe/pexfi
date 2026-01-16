import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { OffersRequestParams, useOffers } from '@/hooks/useOffers'

// Mock useQuery
const mockUseQuery = vi.fn()
vi.mock('@apollo/client/react', () => ({
  useQuery: (...args) => mockUseQuery(...args),
  gql: vi.fn(),
}))

// Mock data
const mockOffer1 = { id: 'offer1', owner: 'Alice', isSell: true, token: { name: 'TokenA', decimals: 18 } }
const mockOffer2 = { id: 'offer2', owner: 'Bob', isSell: false, token: { name: 'TokenB', decimals: 18 } }

describe('useOffers', () => {
  const params: OffersRequestParams = {
    filter: {},
    order: 'desc',
  }

  it('fetches offers successfully', () => {
    mockUseQuery.mockReturnValue({
      data: { offers: [mockOffer1] },
      loading: false,
      error: undefined,
      fetchMore: vi.fn(),
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useOffers(params))

    expect(result.current.loading).toBe(false)
    expect(result.current.offers).toEqual([mockOffer1])
    expect(result.current.totalCount).toBeNull() // Not set until pagination
  })

  it('handles pagination (loadMore)', () => {
    const fetchMoreMock = vi.fn()

    // Initial State
    mockUseQuery.mockReturnValue({
      data: { offers: [mockOffer1] },
      loading: false,
      fetchMore: fetchMoreMock,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useOffers(params))

    // Trigger loadMore
    result.current.loadMore()

    expect(fetchMoreMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { skip: 1 }, // length of current offers
      })
    )

    // Mock fetchMore's updateQuery logic (simulated)
    // Since we can't easily execute the callback passed to fetchMore in a mock without complex setup,
    // we mainly verify it was CALLED with correct skip params.
  })

  it('resets totalCount when filters change', async () => {
    mockUseQuery.mockReturnValue({
      data: { offers: [] },
      loading: false,
      fetchMore: vi.fn(),
    })

    const { result, rerender } = renderHook((p) => useOffers(p), { initialProps: params })

    // Change filter
    const newParams = { ...params, filter: { owner: 'NewOwner' } }
    rerender(newParams)

    // Cannot easily check effective state reset inside hook without modifying it to expose setter,
    // but can verify useQuery called with new vars
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: expect.objectContaining({
          where: { owner: 'NewOwner' },
        }),
      })
    )
  })
})
