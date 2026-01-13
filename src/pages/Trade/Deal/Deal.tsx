import { useParams } from 'react-router-dom'
import { Col, message, Row, Skeleton } from 'antd'
import React, { createContext, useContext, useEffect } from 'react'
import DealCard from '@/pages/Trade/Deal/DealCard'
import MessageBox from '@/pages/Trade/Deal/MessageBox'
import { useDeal, Deal } from '@/wagmi/contracts/useDeal'
import { useOffer, Offer } from '@/wagmi/contracts/useOffer'
import { useProfile, Profile } from '@/wagmi/contracts/useProfile'

export type DealContextValue = {
  deal: Deal
  offer: Offer | null
  ownerProfile: Profile | null
  takerProfile: Profile | null
  isLoading: boolean
  refetch: () => void
}
export const DealContext = createContext<DealContextValue>(null!)
export const useDealContext = () => useContext(DealContext)

export default function DealPage() {
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

  const isLoading = dealLoading || offerLoading

  if (!deal) return <Skeleton active />
  return (
    <DealContext.Provider value={{ deal, offer, ownerProfile, takerProfile, isLoading, refetch }}>
      <Row gutter={5}>
        <Col span={16}>
          <DealCard />
        </Col>
        <Col span={8}>
          <MessageBox />
        </Col>
      </Row>
    </DealContext.Provider>
  )
}
