import { useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Address, hexToString, trim } from 'viem'
import { useInventory, decodeMethod } from '@/shared/web3'

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

interface SubgraphToken {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
}

interface SubgraphOffer {
  id: string
  owner: string
  isSell: boolean
  fiat: string
  methods: string
  token: SubgraphToken | null
}

interface SubgraphDeal {
  id: string
  createdAt: number
  state: number
  taker: string
  tokenAmount: string
  fiatAmount: string
  method: string
  offer: SubgraphOffer
}

interface UserDealsData {
  deals: SubgraphDeal[]
}

interface UserDealsVars {
  address: string
}

export function useUserDeals(options: { pollInterval?: number } = {}) {
  const { address } = useAccount()
  const { methods, loading: inventoryLoading } = useInventory()

  const { data, loading: dealsLoading, error, refetch, stopPolling } = useQuery<UserDealsData, UserDealsVars>(GQL_USER_DEALS, {
    variables: { address: address?.toLowerCase() as string },
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

  const deals = useMemo(() => {
    if (!data?.deals) return undefined

    return data.deals.map((d) => {
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
