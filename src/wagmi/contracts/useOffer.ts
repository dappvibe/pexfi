import { useEffect, useMemo } from 'react'
import { Address, hexToString, trim } from 'viem'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

export type Token = {
  address: Address
  name: string
  symbol: string
  decimals: number
}

export type Offer = {
  id: string
  address: Address
  owner: Address
  isSell: boolean
  token: Token | null
  fiat: string
  method: string // alias for methods bitmask
  rate: bigint
  minFiat: number
  maxFiat: number
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

export function useOffer(address: Address | undefined, options: UseOfferOptions = {}) {
  const { pollInterval = 0 } = options
  const { data, loading, error, refetch, stopPolling } = useQuery(GQL_OFFER, {
    variables: { id: address?.toLowerCase() },
    skip: !address,
    pollInterval,
  })

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const offer = useMemo<Offer | null>(() => {
    if (!data?.offer) return null

    const { offer: d } = data

    return {
      id: d.id,
      address: d.id as Address,
      owner: d.owner as Address,
      isSell: d.isSell,
      token: d.token
        ? {
            address: d.token.address as Address,
            name: d.token.name,
            symbol: d.token.symbol,
            decimals: d.token.decimals,
          }
        : null,
      fiat: hexToString(trim(d.fiat as `0x${string}`, { dir: 'right' })),
      method: d.methods.toString(),
      rate: BigInt(d.rate),
      minFiat: d.minFiat,
      maxFiat: d.maxFiat,
      terms: d.terms,
      disabled: d.disabled,
    }
  }, [data])

  return { offer, isLoading: loading, error, refetch }
}
