import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { type Token } from '@/shared/web3'

export type OffersFilter = {
  disabled?: boolean
  isSell?: boolean
  owner?: string
  token?: string
  fiat?: string
  methods?: string
  methods_in?: string[]
  minFiat_lte?: number
  maxFiat_gte?: number
}

export type OffersRequestParams = {
  filter: OffersFilter
  order: 'asc' | 'desc'
}


export type Offer = {
  id: string
  owner: string
  profile: {
    id: string
    dealsCompleted: number
    rating: number
  } | null
  isSell: boolean
  token: Pick<Token, 'id' | 'name' | 'decimals' | 'address'>
  fiat: string
  methods: string
  rate: number
  minFiat: number
  maxFiat: number
  terms: string
  disabled: boolean
}

export type UseQueryOffersResult = {
  offers: Offer[] | undefined
  totalCount: number | null
  loading: boolean
  error: Error | undefined
  loadMore: () => void
  refetch: () => void
}

const RECORDS_PER_FETCH = 1000
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
        address
        name
        decimals
      }
      fiat
      methods
      rate
      minFiat
      maxFiat
      terms
      disabled
    }
  }
`

export function useQueryOffers(params: OffersRequestParams): UseQueryOffersResult {
  const { data, loading, error, fetchMore, refetch } = useQuery(GQL_OFFERS, {
    variables: {
      first: RECORDS_PER_FETCH,
      skip: 0,
      where: params.filter,
      orderDirection: params.order,
    },
  })

  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [prevFilter, setPrevFilter] = useState(params.filter)

  // Re-trigger totalCount reset if filter changes
  if (JSON.stringify(params.filter) !== JSON.stringify(prevFilter)) {
    setPrevFilter(params.filter)
    setTotalCount(null)
  }

  function loadMore() {
    if (!data?.offers) return
    return fetchMore({
      variables: {
        skip: data.offers.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        if (fetchMoreResult.offers.length < RECORDS_PER_FETCH) {
          setTotalCount(prev.offers.length + fetchMoreResult.offers.length)
        } // fetched all
        return { ...prev, offers: [...prev.offers, ...fetchMoreResult.offers] }
      },
    })
  }

  return {
    offers: data?.offers,
    totalCount,
    loadMore,
    refetch,
    loading,
    error,
  }
}
