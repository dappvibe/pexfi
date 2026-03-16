import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { Address, hexToString, trim } from 'viem'
import { useInventory } from '@/shared/web3'

const GQL_DEAL = gql`
  query Deal($id: ID!) {
    deal(id: $id) {
      id
      method
      terms
      paymentInstructions
    }
  }
`

interface GraphDeal {
  id: string
  method: string
  terms: string | null
  paymentInstructions: string | null
}

interface DealQueryVars {
  id: string
}

export function useQueryDeal(dealId: string | undefined) {
  const { methods, loading: inventoryLoading } = useInventory()

  const { data: subgraphData, loading: subgraphLoading } = useQuery<{ deal: GraphDeal }, DealQueryVars>(GQL_DEAL, {
    variables: { id: dealId?.toLowerCase() as string },
    skip: !dealId,
  })

  const subgraphInfo = useMemo(() => {
    let methodName = ''
    let terms = ''
    let paymentInstructions = ''

    if (subgraphData?.deal) {
      const d = subgraphData.deal
      try {
        methodName = hexToString(trim(d.method as Address, { dir: 'right' }))
      } catch (e) {
        const found = Object.values(methods).find((m: any) => Number(m.index) === Number(d.method))
        methodName = found ? (found as any).name : `Method #${d.method}`
      }
      terms = d.terms || ''
      paymentInstructions = d.paymentInstructions || ''
    }

    return {
      methodName,
      terms,
      paymentInstructions,
    }
  }, [subgraphData, methods])

  return { subgraphInfo, subgraphLoading: subgraphLoading || inventoryLoading }
}
