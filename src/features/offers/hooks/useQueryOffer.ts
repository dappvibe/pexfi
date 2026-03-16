import { useMemo } from 'react'
import { Address, hexToString, trim } from 'viem'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { decodeMethod, type Token, useInventory } from '@/shared/web3'

export type Offer = {
  id: string
  address: Address
  owner: Address
  isSell: boolean
  token: Token | null
  fiat: string
  method: string // bitmask as string for compatibility
  rate: number // normalized rate (e.g. 0.01 for 1%)
  min: number
  max: number
  terms: string
  disabled: boolean
}

const GQL_OFFER = gql`
  query Offer($id: ID!) {
    offer(id: $id) {
      id
      owner
      isSell
      token {
        id
        address
        name
        symbol
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

interface UseOfferOptions {
  pollInterval?: number
}

interface RawToken {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
}

interface RawOffer {
  id: string
  owner: string
  isSell: boolean
  token: RawToken | null
  fiat: string
  methods: string
  rate: number
  minFiat: number
  maxFiat: number
  terms: string
  disabled: boolean
}

interface OfferQueryResult {
  offer: RawOffer | null
}

interface OfferQueryVars {
  id: string
}

/**
 * Reads offer data from the subgraph by its ID (contract address)
 */
export function useQueryOffer(offerId: string | undefined, options: UseOfferOptions = {}) {
  const { pollInterval = 0 } = options
  const { methods } = useInventory()

  const { data, loading, error, refetch } = useQuery<OfferQueryResult, OfferQueryVars>(GQL_OFFER, {
    variables: { id: offerId?.toLowerCase() as string },
    skip: !offerId,
    pollInterval,
    fetchPolicy: 'network-only',
  })

  const rawOffer = data?.offer

  const offer = useMemo<Offer | null>(() => {
    if (!rawOffer) return null

    const normalizedRate = rawOffer.rate / 10000

    return {
      id: rawOffer.id,
      address: rawOffer.id as Address,
      owner: rawOffer.owner as Address,
      isSell: rawOffer.isSell,
      token: rawOffer.token
        ? {
            id: rawOffer.token.id,
            address: rawOffer.token.address as Address,
            name: rawOffer.token.name,
            symbol: rawOffer.token.symbol,
            decimals: rawOffer.token.decimals,
          }
        : null,
      fiat: hexToString(trim(rawOffer.fiat as Address, { dir: 'right' })),
      method: decodeMethod(rawOffer.methods, methods),
      rate: normalizedRate,
      min: rawOffer.minFiat,
      max: rawOffer.maxFiat,
      terms: rawOffer.terms,
      disabled: rawOffer.disabled,
    }
  }, [rawOffer, methods])

  return {
    offer,
    isLoading: loading,
    error,
    refetch,
  }
}
