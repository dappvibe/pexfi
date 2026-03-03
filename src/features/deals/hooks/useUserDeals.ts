import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { hexToString, trim } from 'viem'

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
          symbol
          decimals
        }
      }
    }
  }
`

export function useUserDeals() {
  const { address } = useAccount()

  const { data, loading, error, refetch } = useQuery(GQL_USER_DEALS, {
    variables: { address: address?.toLowerCase() },
    skip: !address,
  })

  const deals = useMemo(() => {
    if (!data?.deals) return undefined

    return data.deals.map((d: any) => ({
      ...d,
      tokenAmountFormatted: Number(BigInt(d.tokenAmount)) / 10 ** d.offer.token.decimals,
      fiatAmountFormatted: Number(BigInt(d.fiatAmount)) / 10 ** 6,
      offer: {
        ...d.offer,
        fiat: hexToString(trim(d.offer.fiat as `0x${string}`, { dir: 'right' })),
        method: d.offer.methods.toString(),
      }
    }))
  }, [data])

  return { deals, loading, error, refetch }
}
