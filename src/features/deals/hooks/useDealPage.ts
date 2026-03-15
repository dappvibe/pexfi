import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useReadDeal } from './useReadDeal'
import { useOffer } from '@/features/offers/hooks/useOffer'
import { useQueryProfile } from '@/features/profile/hooks/useQueryProfile'
import { useDealSubgraph } from '@/features/deals/hooks/useDealSubgraph'

export function useDealPage() {
  const { dealId } = useParams()

  const { deal: contractDeal, isLoading: dealLoading, error, refetch } = useReadDeal(dealId as `0x${string}`)
  const { offer, isLoading: offerLoading } = useOffer(contractDeal?.offer)
  const { profile: ownerProfile, loading: ownerProfileLoading } = useQueryProfile(offer?.owner)
  const { profile: takerProfile, loading: takerProfileLoading } = useQueryProfile(contractDeal?.taker)

  const { subgraphInfo, subgraphLoading } = useDealSubgraph(dealId)

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
      method: subgraphInfo.methodName || contractDeal.method,
      terms: subgraphInfo.terms || contractDeal.terms,
      paymentInstructions: subgraphInfo.paymentInstructions || contractDeal.paymentInstructions,
    }
  }, [contractDeal, subgraphInfo])

  return {
    deal,
    offer,
    ownerProfile,
    takerProfile,
    isLoading: dealLoading || offerLoading || subgraphLoading || ownerProfileLoading || takerProfileLoading,
    refetch,
  }
}
