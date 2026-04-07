import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Address, hexToString, trim } from 'viem'
import { useInventory } from '@/shared/web3'

const GQL_DEAL = gql`
  query Deal($dealId: ID!) {
    deal(id: $dealId) {
      id
      method
      fiatAmount
      terms
      paymentInstructions
      feedbackForOwner {
        id
        upvote
        message
      }
      feedbackForTaker {
        id
        upvote
        message
      }
    }
  }
`

interface GraphDeal {
  id: string
  method: string
  fiatAmount: string
  terms: string | null
  paymentInstructions: string | null
  feedbackForOwner: {
    id: string
    upvote: boolean
    message: string
  } | null
  feedbackForTaker: {
    id: string
    upvote: boolean
    message: string
  } | null
}

export function useQueryDeal(dealId: string | undefined) {
  const { methods, loading: inventoryLoading } = useInventory()

  const { data: subgraphData, loading: subgraphLoading } = useQuery<{ deal: GraphDeal }>(GQL_DEAL, {
    variables: { dealId: (dealId || '').toLowerCase() },
    skip: !dealId,
  })

  const subgraphInfo = useMemo(() => {
    let methodName = ''
    let fiatAmount = 0n
    let fiatAmountFormatted = 0
    let terms = ''
    let paymentInstructions = ''
    let feedbackForOwner: GraphDeal['feedbackForOwner'] = null
    let feedbackForTaker: GraphDeal['feedbackForTaker'] = null

    if (subgraphData?.deal) {
      const d = subgraphData.deal
      try {
        methodName = hexToString(trim(d.method as Address, { dir: 'right' }))
      } catch (e) {
        const found = Object.values(methods).find((m: any) => Number(m.index) === Number(d.method))
        methodName = found ? (found as any).name : `Method #${d.method}`
      }
      fiatAmount = BigInt(d.fiatAmount)
      fiatAmountFormatted = Number(fiatAmount) / 10 ** 6
      terms = d.terms || ''
      paymentInstructions = d.paymentInstructions || ''
      feedbackForOwner = d.feedbackForOwner
      feedbackForTaker = d.feedbackForTaker
    }

    return {
      methodName,
      fiatAmount,
      fiatAmountFormatted,
      terms,
      paymentInstructions,
      feedbackForOwner,
      feedbackForTaker,
    }
  }, [subgraphData, methods])

  return { subgraphInfo, subgraphLoading: subgraphLoading || inventoryLoading }
}
