import { useMemo, useEffect } from 'react'
import { useConnection } from 'wagmi'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Address, hexToString, trim } from 'viem'
import { useInventory, decodeMethod } from '@/shared/web3'

export interface RawUserDeal {
  id: string
  createdAt: number
  state: number
  taker: Address
  tokenAmount: string
  fiatAmount: string
  method: string
  offer: {
    id: string
    owner: Address
    isSell: boolean
    fiat: Address
    methods: string
    token: {
      id: string
      address: Address
      name: string
      symbol: string
      decimals: number
    }
  }
}

export interface UserDeal extends Omit<RawUserDeal, 'offer'> {
  tokenAmountFormatted: number
  fiatAmountFormatted: number
  offer: RawUserDeal['offer'] & {
    fiat: string
    method: string
    methodsNames: string[]
  }
}

const GQL_USER_DEALS = gql`
  query UserDeals($address: Bytes!) {
    deals(
      where: { or: [{ taker: $address }, { offer_: { owner: $address } }] }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      createdAt
      state
      taker
      tokenAmount
      fiatAmount
      method
      offer {
        id
        owner
        isSell
        fiat
        methods
        token {
          id
          address
          name
          symbol
          decimals
        }
      }
    }
  }
`

export function useUserDeals(options: { pollInterval?: number } = {}) {
  const { address } = useConnection()
  const { methods, loading: inventoryLoading } = useInventory()

  const { data, loading: dealsLoading, error, refetch, stopPolling } = useQuery<{ deals: RawUserDeal[] }>(GQL_USER_DEALS, {
    variables: { address: address?.toLowerCase() },
    skip: !address,
    pollInterval: options.pollInterval,
  })

  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling()
      }
    }
  }, [stopPolling])

  const deals = useMemo<UserDeal[] | undefined>(() => {
    if (!data?.deals) return undefined

    return data.deals.map((d: RawUserDeal) => {
      let methodName: string
      try {
        // d.method is the chosen method stored as bytes16 in contract (hex in subgraph)
        methodName = hexToString(trim(d.method as Address, { dir: 'right' }))
      } catch (e) {
        // Fallback for cases where it might be numeric index or other
        const found = Object.values(methods).find((m) => Number(m.index) === Number(d.method))
        methodName = found ? found.name : `Method #${d.method}`
      }

      return {
        ...d,
        tokenAmountFormatted: Number(BigInt(d.tokenAmount)) / 10 ** (d.offer.token?.decimals || 18),
        fiatAmountFormatted: Number(BigInt(d.fiatAmount)) / 10 ** 6,
        offer: {
          ...d.offer,
          fiat: hexToString(trim((d.offer.fiat as Address) || '0x00', { dir: 'right' })),
          method: methodName,
          methodsNames: decodeMethod(d.offer.methods, methods)
        }
      }
    })
  }, [data, methods])

  return { 
    deals, 
    loading: dealsLoading || inventoryLoading, 
    error, 
    refetch 
  }
}
