import { createContext, useContext } from 'react'
import { Deal } from './useReadDeal'
import { Message } from './useDealMessages'
import { FeedbackState } from './useDealFeedback'

export type DealContextValue = {
  deal: Deal
  messages: Message[]
  feedback: FeedbackState
  isLoading: boolean
  refetch: () => void
}

export const DealContext = createContext<DealContextValue>(null!)
export const useDealContext = () => useContext(DealContext)
