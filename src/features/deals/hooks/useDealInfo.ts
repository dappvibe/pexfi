import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useReadDeal } from './useReadDeal'
import { useQueryDeal } from '@/features/deals/hooks/useQueryDeal.ts'

export function useDealInfo() {
  const { dealId } = useParams()

  const { deal: contractDeal, isLoading: dealLoading, error, refetch } = useReadDeal(dealId as Address)
  const { subgraphInfo, subgraphLoading } = useQueryDeal(dealId)

  useEffect(() => {
    if (error) {
      console.error(error)
      message.error('Failed to load deal')
    }
  }, [error])

  const deal = useMemo(() => {
    if (!contractDeal) return null

    return {
      ...contractDeal,
      method: subgraphInfo?.methodName || contractDeal.method,
      terms: subgraphInfo?.terms || contractDeal.terms,
      paymentInstructions: subgraphInfo?.paymentInstructions || contractDeal.paymentInstructions,
    }
  }, [contractDeal, subgraphInfo])

  return {
    deal,
    isLoading: dealLoading || subgraphLoading,
    refetch,
  }
}
