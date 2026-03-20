import { useCallback } from 'react'
import { Address } from 'viem'
import { usePublicClient } from 'wagmi'
import {
  useWriteOfferSetRate,
  useWriteOfferSetLimits,
  useWriteOfferSetTerms,
  useWriteOfferSetDisabled,
} from '@/wagmi'

export function useOfferActions(offerId: string | undefined, onUpdate?: () => void) {
  const publicClient = usePublicClient()

  const { writeContractAsync: setRateTx, isPending: isSettingRate } = useWriteOfferSetRate()
  const { writeContractAsync: setLimitsTx, isPending: isSettingLimits } = useWriteOfferSetLimits()
  const { writeContractAsync: setTermsTx, isPending: isSettingTerms } = useWriteOfferSetTerms()
  const { writeContractAsync: setDisabledTx, isPending: isTogglingDisabled } = useWriteOfferSetDisabled()

  const setRate = useCallback(
    async (rate: number) => {
      if (!offerId) return
      const hash = await setRateTx({
        address: offerId as Address,
        args: [Math.floor(rate * 10000)],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onUpdate?.()
    },
    [offerId, setRateTx, publicClient, onUpdate]
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
      onUpdate?.()
    },
    [offerId, setLimitsTx, publicClient, onUpdate]
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
      onUpdate?.()
    },
    [offerId, setTermsTx, publicClient, onUpdate]
  )

  const toggleDisabled = useCallback(
    async (currentDisabledState: boolean) => {
      if (!offerId) return
      const hash = await setDisabledTx({
        address: offerId as Address,
        args: [!currentDisabledState],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onUpdate?.()
    },
    [offerId, setDisabledTx, publicClient, onUpdate]
  )

  return {
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
    isSettingRate,
    isSettingLimits,
    isSettingTerms,
    isTogglingDisabled,
  }
}
