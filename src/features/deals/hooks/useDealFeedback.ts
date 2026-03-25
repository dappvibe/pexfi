import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useChainId, useWatchContractEvent } from 'wagmi'
import { dealAbi } from '@/wagmi'

export type Feedback = {
  given: boolean
  upvote: boolean
}

export type FeedbackState = {
  forOwner?: Feedback
  forTaker?: Feedback
}

export function useDealFeedback(address: Address | undefined, taker: Address | undefined) {
  const chainId = useChainId()
  const [feedback, setFeedback] = useState<FeedbackState>({})

  useEffect(() => {
    setFeedback({})
  }, [chainId])

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'FeedbackGiven',
    onLogs: (logs) => {
      const log = logs[0]
      if (!log?.args) return
      const { to, upvote } = log.args as { to: Address; upvote: boolean }
      const fb: Feedback = { given: true, upvote }
      setFeedback((prev) => ({
        ...prev,
        ...(to === taker ? { forTaker: fb } : { forOwner: fb }),
      }))
    },
    enabled: !!address && !!taker,
  })

  return { feedback }
}
