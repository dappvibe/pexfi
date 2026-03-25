import { useEffect, useMemo, useState } from 'react'
import { useChainId, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { Address, formatUnits } from 'viem'
import { dealAbi, offerAbi } from '@/wagmi'
import { useInventory } from '@/shared/web3'

export enum DealState {
  Initiated = 0,
  Accepted = 1,
  Funded = 2,
  Paid = 3,
  Disputed = 4,
  Canceled = 5,
  Resolved = 6,
  Completed = 7,
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
  canCancelUnaccepted: boolean
  canCancelUnpaid: boolean
  resolvedPaid: boolean
}

export function useReadDeal(address: Address | undefined) {
  const [state, setState] = useState<DealState | undefined>()
  const chainId = useChainId()
  const { tokens } = useInventory()
  const dealContract = address ? ({ address, abi: dealAbi } as const) : null

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: dealContract
      ? [
          { ...dealContract, functionName: 'state' },
          { ...dealContract, functionName: 'offer' },
          { ...dealContract, functionName: 'taker' },
          { ...dealContract, functionName: 'tokenAmount' },
          { ...dealContract, functionName: 'allowCancelUnacceptedAfter' },
          { ...dealContract, functionName: 'allowCancelUnpaidAfter' },
          { ...dealContract, functionName: 'resolvedPaid' },
        ]
      : [],
    query: {
      enabled: !!address,
    },
  })

  const offerAddress = data?.[1]?.result as Address | undefined

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
    setState(undefined)
  }, [address])

  useEffect(() => {
    refetch()
  }, [chainId, refetch])

  const deal = useMemo<Deal | null>(() => {
    if (!data || !address) return null

    const fetchedState = data[0]?.status === 'success' ? (Number(data[0].result) as DealState) : DealState.Initiated
    const currentState = state ?? fetchedState
    const allowCancelUnacceptedAfter = new Date(Number(data[4]?.result || 0) * 1000)
    const allowCancelUnpaidAfter = new Date(Number(data[5]?.result || 0) * 1000)
    const now = new Date()

    const taker = (data[2]?.result as Address) || '0x0000000000000000000000000000000000000000'

    const tokenAmount = (data[3]?.result as bigint) || 0n

    const tokenSymbol = offerTokenSymbol as string | undefined
    const decimals = (tokenSymbol && tokens[tokenSymbol]?.decimals) ?? 18

    return {
      address,
      state: currentState,
      offer: (data[1]?.result as Address) || '0x0000000000000000000000000000000000000000',
      taker,
      tokenAmount,
      tokenAmountFormatted: Number(formatUnits(tokenAmount, decimals)),
      fiatAmount: 0n,
      fiatAmountFormatted: 0,
      method: '',
      terms: '',
      paymentInstructions: '',
      allowCancelUnacceptedAfter,
      allowCancelUnpaidAfter,
      canCancelUnaccepted: currentState === DealState.Initiated && now >= allowCancelUnacceptedAfter,
      canCancelUnpaid: currentState === DealState.Funded && now >= allowCancelUnpaidAfter,
      resolvedPaid: !!data[6]?.result,
    }
  }, [data, address, state, offerTokenSymbol, tokens])

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

  return { deal, isLoading, error, refetch }
}
