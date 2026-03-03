import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useDeal } from '@/wagmi/contracts/useDeal'
import { useOffer } from '@/wagmi/contracts/useOffer'
import { useProfile } from '@/wagmi/contracts/useProfile'

export function useDealPage() {
  const { dealId } = useParams()

  const { deal, isLoading: dealLoading, error, refetch } = useDeal(dealId as `0x${string}`)
  const { offer, isLoading: offerLoading } = useOffer(deal?.offer)
  const { profile: ownerProfile } = useProfile(offer?.owner)
  const { profile: takerProfile } = useProfile(deal?.taker)

  useEffect(() => {
    if (error) {
      console.error(error)
      message.error('Failed to load deal')
    }
  }, [error])

  return {
    deal,
    offer,
    ownerProfile,
    takerProfile,
    isLoading: dealLoading || offerLoading,
    refetch,
  }
}
