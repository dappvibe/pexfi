import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import { padHex, stringToHex, parseEventLogs } from 'viem'
import { usePublicClient } from 'wagmi'
import { useInventory } from '@/shared/web3'
import { useReadMarketGetPrice, useWriteMarketCreateOffer, marketAbi } from '@/wagmi'
import { useAddress } from '@/shared/web3'

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
  const { writeContractAsync: createOffer } = useWriteMarketCreateOffer()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { tokens, fiats, methods, loading: inventoryLoading } = useInventory()
  const [form] = Form.useForm()

  const [rateParams, setRateParams] = useState<{
    token: `0x${string}`
    fiat: `0x${string}`
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
      const price = (Number(priceData) / 10 ** 6).toFixed(2)
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
      setRateParams(prev => {
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
      const price = (Number(priceData) / 10 ** 6).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    } else fetchRate()
  }, [priceData, form, fetchRate])

  async function handleSetRate() {
    if (!setRate) return
    try {
      await setRate(form.getFieldValue('rate'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update rate')
    }
  }

  async function handleSetLimits() {
    if (!setLimits) return
    try {
      await setLimits(form.getFieldValue('min'), form.getFieldValue('max'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update limits')
    }
  }

  async function handleSetTerms() {
    if (!setTerms) return
    try {
      await setTerms(form.getFieldValue('terms'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update terms')
    }
  }

  async function handleToggleDisabled() {
    if (!toggleDisabled) return
    try {
      await toggleDisabled()
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to toggle state')
    }
  }

  async function onFinish(val) {
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
      const hash = await createOffer({
        address: marketAddress,
        args: [params],
      })
      message.info('Offer submitted. You will be redirected shortly.')

      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      if (receipt) {
        const logs = parseEventLogs({
          abi: marketAbi,
          eventName: 'OfferCreated',
          logs: receipt.logs,
        })
        if (logs.length > 0) {
          const newOfferAddress = (logs[0].args as any).offer
          navigate(`/trade/offer/${newOfferAddress}`)
        }
      }
    } catch (e: any) {
      console.error('Submission error:', e)
      message.error(e.shortMessage || e.message || 'Failed to submit offer')
    } finally {
      setLockSubmit(false)
    }
  }

  return {
    form,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    lockSubmit,
    onFinish,
    fetchRate,
    previewPrice,
    handleSetRate,
    handleSetLimits,
    handleSetTerms,
    handleToggleDisabled,
  }
}
