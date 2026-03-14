import { useState, useEffect, useCallback } from 'react'
import type { FormInstance } from 'antd'
import { normalizeMarketPrice } from '@/utils'
import { padHex, stringToHex } from 'viem'
import type { Token, Fiat } from '@/shared/web3'
import type { RateParams } from '../types/offer'

interface UseOfferFormDataParams {
  form: FormInstance
  tokens: Record<string, Token>
  offer?: any
}

interface UseOfferFormDataReturn {
  rateParams: RateParams | null
  fetchRate: () => void
  previewPrice: (priceData?: bigint) => void
}

export function useOfferFormData({
  form,
  tokens,
  offer,
}: UseOfferFormDataParams): UseOfferFormDataReturn {
  const [rateParams, setRateParams] = useState<RateParams | null>(null)

  const fetchRate = useCallback(() => {
    const tokenSymbol = form.getFieldValue('token')
    const fiat = form.getFieldValue('fiat')

    if (tokenSymbol && fiat) {
      const token = tokens[tokenSymbol]
      if (!token) return

      const fiatBytes3 = padHex(stringToHex(fiat), { size: 3, dir: 'right' })
      setRateParams((prev) => {
        if (prev?.token !== token.address || prev?.fiat !== fiatBytes3) {
          return { token: token.address, fiat: fiatBytes3 }
        }
        return prev
      })
    }
  }, [form, tokens])

  const previewPrice = useCallback(
    (marketPrice?: bigint) => {
      if (!marketPrice) return
      
      const price = normalizeMarketPrice(marketPrice).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    },
    [form]
  )

  // Auto-fetch rate when offer is loaded
  useEffect(() => {
    if (offer && tokens[offer.token?.symbol]) {
      fetchRate()
    }
  }, [offer, tokens, fetchRate])

  return { rateParams, fetchRate, previewPrice }
}
