import { useMemo, useEffect } from 'react'
import { Address, padHex, hexToString, trim } from 'viem'
import { normalizeMarketPrice } from '@/utils'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useAddress, useInventory, decodeMethod, type Token } from '@/shared/web3'
import { useReadMarketGetPrice } from '@/wagmi'


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
  price?: string // calculated price
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
  fetchPrice?: boolean
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

export function useOffer(offerId: string | undefined, options: UseOfferOptions = {}) {
  const { fetchPrice = false, pollInterval = 0 } = options
  const marketAddress = useAddress('Market#Market')
  const { methods } = useInventory()

  const { data, loading, error, refetch, stopPolling } = useQuery<OfferQueryResult>(GQL_OFFER, {
    variables: { id: offerId?.toLowerCase() },
    skip: !offerId,
    pollInterval,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling()
      }
    }
  }, [stopPolling])

  const rawOffer = data?.offer

  // Fetch price if needed
  const { data: marketPrice } = useReadMarketGetPrice({
    address: marketAddress as Address,
    args: rawOffer
      ? [rawOffer.token.address as Address, padHex(rawOffer.fiat as `0x${string}`, { size: 3, dir: 'right' })]
      : undefined,
    query: { enabled: fetchPrice && !!rawOffer && !!marketAddress },
  })

  const offer = useMemo<Offer | null>(() => {
    if (!rawOffer) return null

    const normalizedRate = rawOffer.rate / 10000
    let price: string | undefined
    if (marketPrice !== undefined) {
      const basePrice = normalizeMarketPrice(marketPrice as bigint)
      price = (basePrice * normalizedRate).toFixed(3)
    }

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
      fiat: hexToString(trim(rawOffer.fiat as `0x${string}`, { dir: 'right' })),
      method: decodeMethod(rawOffer.methods, methods),
      rate: normalizedRate,
      min: rawOffer.minFiat,
      max: rawOffer.maxFiat,
      terms: rawOffer.terms,
      disabled: rawOffer.disabled,
      price,
    }
  }, [rawOffer, marketPrice, methods])

  return {
    offer,
    isLoading: loading,
    error,
    refetch,
  }
}
