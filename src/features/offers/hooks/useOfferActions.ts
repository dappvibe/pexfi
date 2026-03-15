import { useCallback } from 'react'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import {
  useWriteOfferSetRate,
  useWriteOfferSetLimits,
  useWriteOfferSetTerms,
  useWriteOfferSetDisabled,
} from '@/wagmi'
import { type Offer } from './useOffer'

export function useOfferActions(offerId: string | undefined, offer: Offer | null, refetch: () => void) {
  const { writeContractAsync: setRateTx } = useWriteOfferSetRate()
  const { writeContractAsync: setLimitsTx } = useWriteOfferSetLimits()
  const { writeContractAsync: setTermsTx } = useWriteOfferSetTerms()
  const { writeContractAsync: setDisabledTx } = useWriteOfferSetDisabled()
  const publicClient = usePublicClient()

  const setRate = useCallback(
    async (rate: number) => {
      if (!offerId) return
      const hash = await setRateTx({
        address: offerId as Address,
        args: [Math.floor(rate * 10000)],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      // Small delay to allow subgraph to pick up the change
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setRateTx, refetch, publicClient]
  )

  const setLimits = useCallback(
    async (min: number, max: number) => {
      if (!offerId) return
      const hash = await setLimitsTx({
        address: offerId as Address,
        args: [{ min: Math.floor(min), max: Math.floor(max) }],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setLimitsTx, refetch, publicClient]
  )

  const setTerms = useCallback(
    async (terms: string) => {
      if (!offerId) return
      const hash = await setTermsTx({
        address: offerId as Address,
        args: [terms],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setTermsTx, refetch, publicClient]
  )

  const toggleDisabled = useCallback(async () => {
    if (!offerId || !offer) return
    const hash = await setDisabledTx({
      address: offerId as Address,
      args: [!offer.disabled],
    })
    await publicClient?.waitForTransactionReceipt({ hash })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await refetch()
  }, [offerId, offer, setDisabledTx, refetch, publicClient])

  return {
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  }
}
