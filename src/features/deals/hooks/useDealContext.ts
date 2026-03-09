import { createContext, useContext } from 'react'
import { Deal } from '@/wagmi/contracts/useDeal'
import { Offer } from '@/features/offers/hooks/useOffer'
import { Profile } from '@/wagmi/contracts/useProfile'

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
