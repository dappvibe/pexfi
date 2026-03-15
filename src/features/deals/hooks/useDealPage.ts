import { useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useReadDeal } from './useReadDeal'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer.ts'
import { useOfferPrice } from '@/features/offers/hooks/useOfferPrice'
import { useQueryProfile } from '@/features/profile/hooks/useQueryProfile'
import { useQueryDeal } from '@/features/deals/hooks/useQueryDeal.ts'

export function useDealPage() {
  const { dealId } = useParams()

  const { deal: contractDeal, isLoading: dealLoading, error, refetch } = useReadDeal(dealId as Address)
  const { offer: baseOffer, isLoading: offerLoading } = useQueryOffer(contractDeal?.offer)
  const { price, isLoading: priceLoading } = useOfferPrice(baseOffer, true)

  const offer = baseOffer ? { ...baseOffer, price } : null

  const { profile: ownerProfile, loading: ownerProfileLoading } = useQueryProfile(offer?.owner)
  const { profile: takerProfile, loading: takerProfileLoading } = useQueryProfile(contractDeal?.taker)

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
    isLoading: dealLoading || offerLoading || priceLoading || subgraphLoading || ownerProfileLoading || takerProfileLoading,
    refetch,
  }
}
