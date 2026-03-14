import { useCallback, useEffect, useState } from 'react'
import { Form } from 'antd'
import type { FormInstance } from 'antd'
import { useReadMarketGetPrice } from '@/wagmi'
import { useAddress, useInventory } from '@/shared/web3'
import { useOfferFormData } from './useOfferFormData'
import { useOfferActions } from './useOfferActions'
import type { Token, Fiat, Method } from '@/shared/web3'

interface UseEditOfferFormParams {
  offer: any
  setRate: (rate: number) => Promise<void>
  setLimits: (min: number, max: number) => Promise<void>
  setTerms: (terms: string) => Promise<void>
  toggleDisabled: () => Promise<void>
}

interface UseEditOfferFormReturn {
  form: FormInstance
  tokens: Record<string, Token>
  fiats: Record<string, Fiat>
  methods: Record<string, Method>
  inventoryLoading: boolean
  onRateChange: () => void
  previewPrice: () => void
  handleSetRate: () => Promise<void>
  handleSetLimits: () => Promise<void>
  handleSetTerms: () => Promise<void>
  handleToggleDisabled: () => Promise<void>
}

export function useEditOfferForm({
  offer,
  setRate,
  setLimits,
  setTerms,
  toggleDisabled,
}: UseEditOfferFormParams): UseEditOfferFormReturn {
  const marketAddress = useAddress('Market#Market')
  const [form] = Form.useForm()
  const { tokens, fiats, methods, loading: inventoryLoading } = useInventory()

  const { rateParams, fetchRate, previewPrice } = useOfferFormData({
    form,
    tokens,
    offer,
  })

  const { data: priceData } = useReadMarketGetPrice({
    address: marketAddress,
    args: rateParams ? [rateParams.token, rateParams.fiat] : undefined,
    query: {
      enabled: !!rateParams,
    },
  })

  // Update preview when price changes
  useEffect(() => {
    if (priceData) {
      previewPrice(priceData)
    }
  }, [priceData, previewPrice])

  const { handleSetRate, handleSetLimits, handleSetTerms, handleToggleDisabled } =
    useOfferActions({
      form,
      setRate,
      setLimits,
      setTerms,
      toggleDisabled,
    })

  return {
    form,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    onRateChange: fetchRate,
    previewPrice: () => previewPrice(priceData),
    handleSetRate,
    handleSetLimits,
    handleSetTerms,
    handleToggleDisabled,
  }
}
