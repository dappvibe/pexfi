import { createContext, useContext } from 'react'
import { Deal } from './useReadDeal'
import { Offer } from '@/features/offers/hooks/useOffer'
import { Profile } from '@/wagmi/contracts'
import { Message } from './useDealMessages'
import { FeedbackState } from './useDealFeedback'

export type DealContextValue = {
  deal: Deal
  offer: Offer | null
  ownerProfile: Profile | null
  takerProfile: Profile | null
  messages: Message[]
  feedback: FeedbackState
  isLoading: boolean
  refetch: () => void
}

export const DealContext = createContext<DealContextValue>(null!)
export const useDealContext = () => useContext(DealContext)
