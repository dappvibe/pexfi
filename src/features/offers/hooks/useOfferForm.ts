import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import { Address, padHex, stringToHex, parseEventLogs } from 'viem'
import { usePublicClient } from 'wagmi'
import { useInventory } from '@/shared/web3'
import { useReadMarketGetPrice, useWriteMarketCreateOffer, marketAbi } from '@/wagmi'
import { useAddress } from '@/shared/web3'
import { useQueryOffer } from './useQueryOffer.ts'
import { normalizeMarketPrice } from '@/utils'

interface UseOfferFormParams {
  offer?: any
  setRate?: (rate: number) => Promise<void>
  setLimits?: (min: number, max: number) => Promise<void>
  setTerms?: (terms: string) => Promise<void>
  toggleDisabled?: () => Promise<void>
}

export function useOfferForm({ offer = null, setRate, setLimits, setTerms, toggleDisabled }: UseOfferFormParams = {}) {
  const navigate = useNavigate()
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')
  const { mutateAsync: createOfferTx } = useWriteMarketCreateOffer()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { tokens, fiats, methods, loading: inventoryLoading } = useInventory()
  const [form] = Form.useForm()

  const [newOfferAddress, setNewOfferAddress] = useState<string | undefined>()
  // useOffer handles the polling/loading of the offer from the subgraph.
  const { offer: createdOffer, isLoading: isSyncing } = useQueryOffer(newOfferAddress, { pollInterval: 1000 })

  useEffect(() => {
    if (newOfferAddress && createdOffer && !isSyncing) {
      // Redirect once the subgraph has indexed the new offer.
      // This ensures the offer page has data to display.
      navigate(`/trade/offer/${newOfferAddress}`)
    }
  }, [newOfferAddress, createdOffer, isSyncing, navigate])

  const [rateParams, setRateParams] = useState<{
    token: Address
    fiat: Address
  } | null>(null)

  const { data: priceData } = useReadMarketGetPrice({
    address: marketAddress,
    args: rateParams ? [rateParams.token, rateParams.fiat] : undefined,
    query: {
      enabled: !!rateParams,
    },
  })

  useEffect(() => {
    if (priceData) {
      const price = normalizeMarketPrice(priceData).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    }
  }, [priceData, form])

  const fetchRate = useCallback(() => {
    const symbol = form.getFieldValue('token')
    const fiat = form.getFieldValue('fiat')
    if (symbol && fiat) {
      const token = tokens[symbol]
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

  useEffect(() => {
    if (offer && tokens[offer.token?.symbol]) {
      fetchRate()
    }
  }, [offer, tokens, fetchRate])

  const previewPrice = useCallback(() => {
    if (priceData) {
      const price = normalizeMarketPrice(priceData).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    } else fetchRate()
  }, [priceData, form, fetchRate])

  const handleSetRate = useCallback(async () => {
    if (!setRate) return
    try {
      await setRate(form.getFieldValue('rate'))
      message.success('Rate updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update rate')
    }
  }, [form, setRate])

  const handleSetLimits = useCallback(async () => {
    if (!setLimits) return
    try {
      await setLimits(form.getFieldValue('min'), form.getFieldValue('max'))
      message.success('Limits updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update limits')
    }
  }, [form, setLimits])

  const handleSetTerms = useCallback(async () => {
    if (!setTerms) return
    try {
      await setTerms(form.getFieldValue('terms'))
      message.success('Terms updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update terms')
    }
  }, [form, setTerms])

  const handleToggleDisabled = useCallback(async () => {
    if (!toggleDisabled) return
    try {
      await toggleDisabled()
      message.success('State updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to toggle state')
    }
  }, [toggleDisabled])

  async function createOffer(val: any) {
    setLockSubmit(true)

    val.min = Math.floor(val.min)
    val.max = Math.ceil(val.max)
    val.rate = Math.floor((1 + val.rate / 100) * 10 ** 4)
    val.terms ??= ''

    const params = {
      isSell: val.isSell,
      token: tokens[val.token].address,
      fiat: padHex(stringToHex(val.fiat), { size: 3, dir: 'right' }),
      methods: 1n << BigInt(methods[val.method].index),
      rate: val.rate,
      limits: { min: val.min, max: val.max },
      terms: val.terms,
    }

    try {
      const hash = await createOfferTx({
        address: marketAddress,
        args: [params],
      })
      message.loading({ content: 'Offer submitted. Waiting for confirmation...', key: 'createOffer', duration: 0 })

      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      if (receipt) {
        const logs = parseEventLogs({
          abi: marketAbi,
          eventName: 'OfferCreated',
          logs: receipt.logs,
        })
        if (logs.length > 0) {
          const offerAddress = (logs[0].args as any).offer
          setNewOfferAddress(offerAddress)
          message.success({ content: 'Offer confirmed! Syncing...', key: 'createOffer', duration: 2 })
        }
      }
    } catch (e: any) {
      console.error('Submission error:', e)
      message.error({
        content: e.shortMessage || e.message || 'Failed to submit offer',
        key: 'createOffer',
      })
      setLockSubmit(false)
    }
  }

  return {
    form,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    lockSubmit: lockSubmit || !!newOfferAddress,
    createOffer,
    fetchRate,
    previewPrice,
    handleSetRate,
    handleSetLimits,
    handleSetTerms,
    handleToggleDisabled,
  }
}
