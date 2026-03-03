import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing/react'
import { OffersRequestParams, useQueryOffers } from '@/features/offers/hooks/useQueryOffers'
import { gql } from '@apollo/client'
import { describe, test, expect } from 'vitest'

const GQL_OFFERS = gql`
  query Offers($first: Int, $skip: Int, $where: Offer_filter, $orderDirection: String) {
    offers(first: $first, skip: $skip, where: $where, orderDirection: $orderDirection, orderBy: ranging) {
      id
      owner
      profile {
        id
        dealsCompleted
        rating
      }
      isSell
      token {
        id
        name
        decimals
      }
      fiat
      methods
      rate
      minFiat
      maxFiat
      terms
    }
  }
`

const mockOffers = [
  {
    id: '1',
    owner: '0x123',
    profile: null,
    isSell: true,
    token: { id: '0xabc', name: 'WETH', decimals: 18 },
    fiat: '0x555344',
    methods: '1',
    rate: 100,
    minFiat: 10,
    maxFiat: 1000,
    terms: 'terms',
  },
]

const mocks = [
  {
    request: {
      query: GQL_OFFERS,
      variables: {
        first: 20,
        skip: 0,
        where: { disabled: false },
        orderDirection: 'asc',
      },
    },
    result: {
      data: {
        offers: mockOffers,
      },
    },
  },
]

describe('useQueryOffers', () => {
  test('returns offers from query', async () => {
    const params: OffersRequestParams = {
      filter: { disabled: false },
      order: 'asc',
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useQueryOffers(params), {
      wrapper,
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.offers).toEqual(mockOffers)
  })
})
