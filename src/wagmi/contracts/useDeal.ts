import { useEffect, useMemo, useState } from 'react'
import { useChainId, usePublicClient, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { dealAbi, offerAbi } from '@/wagmi'
import { useInventory } from '@/hooks/useInventory'

export enum DealState {
  Created = 0,
  Accepted = 1,
  Funded = 2,
  Paid = 3,
  Disputed = 4,
  Cancelled = 5,
  Resolved = 6,
  Released = 7,
}

export type Feedback = {
  given: boolean
  upvote: boolean
  message: string
}

export type Message = {
  sender: Address
  message: string
  timestamp: number
}

type FeedbackState = {
  forOwner?: Feedback
  forTaker?: Feedback
}

export type Deal = {
  address: Address
  state: DealState
  offer: Address
  taker: Address
  tokenAmount: bigint
  tokenAmountFormatted: number
  fiatAmount: bigint
  fiatAmountFormatted: number
  terms: string
  paymentInstructions: string
  allowCancelUnacceptedAfter: Date
  allowCancelUnpaidAfter: Date
  feedbackForOwner: Feedback | null
  feedbackForTaker: Feedback | null
  messages: Message[]
  /** Is deal in a final state (cancelled or released) */
  isFinal: boolean
  /** Can current user cancel based on timeouts */
  canCancelUnaccepted: boolean
  canCancelUnpaid: boolean
}

export function useDeal(address: Address | undefined) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { tokens } = useInventory()
  const dealContract = address ? ({ address, abi: dealAbi } as const) : null

  const [state, setState] = useState<DealState | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>({})
  const [messages, setMessages] = useState<Message[]>([])

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: dealContract
      ? [
          { ...dealContract, functionName: 'state' },
          { ...dealContract, functionName: 'offer' },
          { ...dealContract, functionName: 'taker' },
          { ...dealContract, functionName: 'tokenAmount' },
          { ...dealContract, functionName: 'fiatAmount' },
          { ...dealContract, functionName: 'terms' },
          { ...dealContract, functionName: 'paymentInstructions' },
          { ...dealContract, functionName: 'allowCancelUnacceptedAfter' },
          { ...dealContract, functionName: 'allowCancelUnpaidAfter' },
          { ...dealContract, functionName: 'feedbackForOwner' },
          { ...dealContract, functionName: 'feedbackForTaker' },
        ]
      : [],
    query: { enabled: !!address },
  })

  const offerAddress = data?.[1]?.result as Address | undefined

  // Deal contract stores only offer address, not token. We need decimals to format tokenAmount.
  // Reading offer.token (symbol) is the simplest way without composing hooks or complicating the page.
  const { data: offerTokenSymbol } = useReadContract({
    address: offerAddress,
    abi: offerAbi,
    functionName: 'token',
    query: { enabled: !!offerAddress },
  })

  useEffect(() => {
    setMessages([])
    setState(null)
    setFeedback({})
    refetch()
    // refetch is memoized so:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  useEffect(() => {
    if (!address || !publicClient) return
    publicClient
      .getLogs({
        address,
        event: {
          type: 'event',
          name: 'Message',
          inputs: [
            { type: 'address', name: 'sender', indexed: true },
            { type: 'string', name: 'message', indexed: false },
          ],
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      })
      .then(async (logs) => {
        const parsed = await Promise.all(
          logs.map(async (log) => {
            const block = await publicClient.getBlock({ blockHash: log.blockHash! })
            return {
              sender: log.args.sender as Address,
              message: log.args.message as string,
              timestamp: Number(block.timestamp),
            }
          })
        )
        setMessages(parsed)
      })
  }, [address, publicClient])

  const deal = useMemo<Deal | null>(() => {
    if (!data || !address || data.some((d) => d.status === 'failure')) return null

    const fetchedState = Number(data[0].result) as DealState
    const currentState = state ?? fetchedState
    const allowCancelUnacceptedAfter = new Date(Number(data[7].result) * 1000)
    const allowCancelUnpaidAfter = new Date(Number(data[8].result) * 1000)
    const now = new Date()

    const taker = data[2].result as Address
    const feedbackOwner = data[9].result as [boolean, boolean, string] | undefined
    const feedbackTaker = data[10].result as [boolean, boolean, string] | undefined

    const parseFeedback = (fb: [boolean, boolean, string] | undefined): Feedback | null =>
      fb?.[0] ? { given: fb[0], upvote: fb[1], message: fb[2] } : null

    const tokenAmount = data[3].result as bigint
    const fiatAmount = data[4].result as bigint

    // offer.token() returns string symbol directly
    const tokenSymbol = offerTokenSymbol as string | undefined
    const decimals = (tokenSymbol && tokens[tokenSymbol]?.decimals) ?? 18

    return {
      address,
      state: currentState,
      offer: data[1].result as Address,
      taker,
      tokenAmount,
      tokenAmountFormatted: formatUnits(tokenAmount, decimals),
      fiatAmount,
      fiatAmountFormatted: formatUnits(fiatAmount, 6),
      terms: data[5].result as string,
      paymentInstructions: data[6].result as string,
      allowCancelUnacceptedAfter,
      allowCancelUnpaidAfter,
      feedbackForOwner: feedback.forOwner ?? parseFeedback(feedbackOwner),
      feedbackForTaker: feedback.forTaker ?? parseFeedback(feedbackTaker),
      messages,
      isFinal: currentState >= DealState.Cancelled,
      canCancelUnaccepted: currentState === DealState.Created && now >= allowCancelUnacceptedAfter,
      canCancelUnpaid: currentState === DealState.Funded && now >= allowCancelUnpaidAfter,
    }
  }, [data, address, state, feedback, messages, offerTokenSymbol, tokens])

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'DealState',
    onLogs: (logs) => {
      const newState = logs[0]?.args?.state
      if (newState !== undefined) {
        setState(Number(newState) as DealState)
      }
    },
    enabled: !!address,
  })

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'FeedbackGiven',
    onLogs: (logs) => {
      const log = logs[0]
      if (!log?.args) return
      const { to, upvote, message } = log.args as { to: Address; upvote: boolean; message: string }
      const fb: Feedback = { given: true, upvote, message }
      const taker = data?.[2]?.result as Address | undefined
      setFeedback((prev) => ({
        ...prev,
        ...(to === taker ? { forTaker: fb } : { forOwner: fb }),
      }))
    },
    enabled: !!address && !!data,
  })

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'Message',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { sender, message } = log.args as { sender: Address; message: string }
        setMessages((prev) => [...prev, { sender, message, timestamp: Math.floor(Date.now() / 1000) }])
      })
    },
    enabled: !!address,
  })

  return { deal, isLoading, error, refetch }
}
