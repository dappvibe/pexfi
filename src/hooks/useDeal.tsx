import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Offer } from './useOffers'

export type Deal = {
  id: string
  state: string | number
  createdAt: number
  allowCancelUnacceptedAfter: number | Date
  allowCancelUnpaidAfter: number | Date
  offer: Offer
  taker: string
  tokenAmount: number
  fiatAmount: number
  terms: string | null
  paymentInstructions: string
  feedbackForOwner: {
    upvote: boolean
    message: string
  } | null
  feedbackForTaker: {
    upvote: boolean
    message: string
  } | null
}

export type UseDealResult = {
  deal: Deal | null
  loading: boolean
  error: Error | undefined
  refetch: () => void
}

const GQL_DEAL = gql`
  query GetDeal($id: ID!) {
    deal(id: $id) {
      id
      state
      createdAt
      allowCancelUnacceptedAfter
      allowCancelUnpaidAfter
      offer {
        id
        owner
        profile {
          id
          rating
          dealsCompleted
        }
        isSell
        token {
          id
          address
          name
          decimals
        }
        fiat
        method
        rate
        minFiat
        maxFiat
        terms
        disabled
      }
      taker
      tokenAmount
      fiatAmount
      terms
      paymentInstructions
      messages(orderBy: createdAt) {
        createdAt
        sender
        message
      }
      feedbackForOwner {
        upvote
        message
      }
      feedbackForTaker {
        upvote
        message
      }
    }
  }
`

export function useDeal(address: string): UseDealResult {
  const { data, loading, error, refetch } = useQuery(GQL_DEAL, {
    variables: { id: address.toLowerCase() },
  })

  return {
    deal: data?.deal,
    loading,
    error,
    refetch,
  }
}
