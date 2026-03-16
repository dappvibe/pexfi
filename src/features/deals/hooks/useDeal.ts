import { useMemo } from 'react'
import { Address } from 'viem'
import { useParams } from 'react-router-dom'
import { useReadDeal } from './useReadDeal'
import { useQueryDeal } from '@/features/deals/hooks/useQueryDeal.ts'

export function useDeal() {
  const { dealId } = useParams()

  const { deal: contractDeal, isLoading: dealLoading, error, refetch } = useReadDeal(dealId as Address)
  const { subgraphInfo, subgraphLoading } = useQueryDeal(dealId)

  const deal = useMemo(() => {
    if (!contractDeal) return null

    return {
      ...contractDeal,
      isPaid: contractDeal.isPaid,
      method: subgraphInfo?.methodName || contractDeal.method,
      terms: subgraphInfo?.terms || contractDeal.terms,
      paymentInstructions: subgraphInfo?.paymentInstructions || contractDeal.paymentInstructions,
    }
  }, [contractDeal, subgraphInfo])

  return {
    deal,
    error,
    isLoading: dealLoading || subgraphLoading,
    refetch,
  }
}
