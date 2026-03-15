import { useEffect, useMemo, useState } from 'react'
import { useChainId, usePublicClient, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { dealAbi, offerAbi } from '@/wagmi'
import { useInventory } from '@/shared/web3'

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
  method: string
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
          { ...dealContract, functionName: 'allowCancelUnacceptedAfter' },
          { ...dealContract, functionName: 'allowCancelUnpaidAfter' },
        ]
      : [],
    query: {
      enabled: !!address,
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  })

  const offerAddress = data?.[1]?.result as Address | undefined

  // Deal contract stores only offer address, not token. We need decimals to format tokenAmount.
  const { data: offerTokenSymbol, refetch: refetchOfferTokenSymbol } = useReadContract({
    address: offerAddress,
    abi: offerAbi,
    functionName: 'token',
    query: { enabled: !!offerAddress },
  })

  useEffect(() => {
    if (offerAddress && typeof refetchOfferTokenSymbol === 'function') {
      refetchOfferTokenSymbol()
    }
  }, [offerAddress, refetchOfferTokenSymbol])

  useEffect(() => {
    setMessages([])
    setState(null)
    setFeedback({})
    refetch()
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
        const blockHashToTimestamp = new Map<string, number>()
        const uniqueBlockHashes = [...new Set(logs.map((log) => log.blockHash!))]
        await Promise.all(
          uniqueBlockHashes.map(async (hash) => {
            const block = await publicClient.getBlock({ blockHash: hash })
            blockHashToTimestamp.set(hash, Number(block.timestamp))
          })
        )

        const parsed = logs.map((log) => ({
          sender: log.args.sender as Address,
          message: log.args.message as string,
          timestamp: blockHashToTimestamp.get(log.blockHash!)!,
        }))
        setMessages(parsed)
      })
  }, [address, publicClient])

  const deal = useMemo<Deal | null>(() => {
    if (!data || !address || data.some((d) => d.status === 'failure')) return null

    const fetchedState = Number(data[0].result) as DealState
    const currentState = state ?? fetchedState
    const allowCancelUnacceptedAfter = new Date(Number(data[5].result) * 1000)
    const allowCancelUnpaidAfter = new Date(Number(data[6].result) * 1000)
    const now = new Date()

    const taker = data[2].result as Address

    const tokenAmount = data[3].result as bigint
    const fiatAmount = data[4].result as bigint

    const tokenSymbol = offerTokenSymbol as string | undefined
    const decimals = (tokenSymbol && tokens[tokenSymbol]?.decimals) ?? 18

    return {
      address,
      state: currentState,
      offer: data[1].result as Address,
      taker,
      tokenAmount,
      tokenAmountFormatted: Number(formatUnits(tokenAmount, decimals)),
      fiatAmount,
      fiatAmountFormatted: Number(formatUnits(fiatAmount, 6)),
      terms: '',
      paymentInstructions: '',
      allowCancelUnacceptedAfter,
      allowCancelUnpaidAfter,
      feedbackForOwner: feedback.forOwner ?? null,
      feedbackForTaker: feedback.forTaker ?? null,
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
      const { to, upvote } = log.args as { to: Address; upvote: boolean }
      const fb: Feedback = { given: true, upvote }
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
