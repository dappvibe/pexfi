import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form } from 'antd'
import type { FormInstance } from 'antd'
import { useReadMarketGetPrice } from '@/wagmi'
import { useAddress, useInventory } from '@/shared/web3'
import { useOfferFormData } from './useOfferFormData'
import { useOfferSubmission } from './useOfferSubmission'
import type { OfferFormData } from '../types/offer'
import type { Token, Fiat, Method } from '@/shared/web3'

interface UseCreateOfferFormReturn {
  form: FormInstance
  tokens: Record<string, Token>
  fiats: Record<string, Fiat>
  methods: Record<string, Method>
  inventoryLoading: boolean
  lockSubmit: boolean
  onSubmit: (values: OfferFormData) => Promise<void>
  onRateChange: () => void
  previewPrice: () => void
}

export function useCreateOfferForm(): UseCreateOfferFormReturn {
  const navigate = useNavigate()
  const marketAddress = useAddress('Market#Market')
  const [form] = Form.useForm()
  const { tokens, fiats, methods, loading: inventoryLoading } = useInventory()
  const [lockSubmit, setLockSubmit] = useState(false)
  const [newOfferAddress, setNewOfferAddress] = useState<string | undefined>()

  const { rateParams, fetchRate, previewPrice } = useOfferFormData({
    form,
    tokens,
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

  const { submitOffer, isSubmitting } = useOfferSubmission({ tokens, methods })

  const handleSubmit = useCallback(
    async (values: OfferFormData) => {
      setLockSubmit(true)
      try {
        const offerAddress = await submitOffer(values)
        if (offerAddress) {
          setNewOfferAddress(offerAddress)
          // Navigate to the new offer page after confirmation
          navigate(`/trade/offer/${offerAddress}`)
        }
      } finally {
        setLockSubmit(false)
      }
    },
    [submitOffer, navigate]
  )

  return {
    form,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    lockSubmit: lockSubmit || isSubmitting || !!newOfferAddress,
    onSubmit: handleSubmit,
    onRateChange: fetchRate,
    previewPrice: () => previewPrice(priceData),
  }
}
