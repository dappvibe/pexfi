import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address, padHex, stringToHex, parseEventLogs } from 'viem'
import { usePublicClient } from 'wagmi'
import { useInventory } from '@/shared/web3'
import { useReadMarketGetPrice, useWriteMarketCreateOffer, marketAbi } from '@/wagmi'
import { useAddress } from '@/shared/web3'
import { useQueryOffer } from './useQueryOffer.ts'
import { normalizeMarketPrice } from '@/utils'
import { useToast } from '@/components/ui/use-toast'

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
  const { writeContractAsync: createOfferTx } = useWriteMarketCreateOffer()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { tokens, fiats, methods, loading: inventoryLoading } = useInventory()
  const { toast } = useToast()

  const [formState, setFormState] = useState<any>({
    isSell: offer?.isSell ?? false,
    token: offer?.token?.symbol ?? 'WETH',
    fiat: offer?.fiat ?? 'USD',
    method: offer?.method ?? '',
    rate: offer ? (offer.rate - 1) * 100 : 0,
    min: offer?.min ?? '',
    max: offer?.max ?? '',
    terms: offer?.terms ?? '',
    preview: '0.00'
  })

  const [newOfferAddress, setNewOfferAddress] = useState<string | undefined>()
  const { offer: createdOffer, isLoading: isSyncing } = useQueryOffer(newOfferAddress, { 
    pollInterval: newOfferAddress ? 3000 : 0, 
    fetchPolicy: 'network-only' 
  })

  useEffect(() => {
    if (newOfferAddress && createdOffer && !isSyncing) {
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

  const updatePreview = useCallback((price: number, rate: number) => {
    const current = price * (1 + rate / 100)
    setFormState((prev: any) => ({ ...prev, preview: current.toFixed(2) }))
  }, [])

  useEffect(() => {
    if (priceData) {
      const price = normalizeMarketPrice(priceData)
      updatePreview(price, formState.rate)
    }
  }, [priceData, formState.rate, updatePreview])

  const fetchRate = useCallback(() => {
    const symbol = formState.token
    const fiat = formState.fiat
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
  }, [formState.token, formState.fiat, tokens])

  useEffect(() => {
    if (offer && tokens[offer.token?.symbol]) {
      fetchRate()
    }
  }, [offer, tokens, fetchRate])

  const previewPrice = useCallback(() => {
    if (priceData) {
      const price = normalizeMarketPrice(priceData)
      updatePreview(price, formState.rate)
    } else fetchRate()
  }, [priceData, formState.rate, fetchRate, updatePreview])

  const handleSetRateLocal = useCallback(async () => {
    if (!setRate) return
    const t = toast({ title: "Updating Rate", description: "Waiting for wallet..." })
    try {
      await setRate(formState.rate)
      t.update({ id: t.id, title: "Rate Updated", description: "Your offer has been updated." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Update Failed", description: e.shortMessage || "Error updating rate", variant: "destructive" })
    }
  }, [formState.rate, setRate, toast])

  const handleSetLimitsLocal = useCallback(async () => {
    if (!setLimits) return
    const t = toast({ title: "Updating Limits", description: "Waiting for wallet..." })
    try {
      await setLimits(formState.min, formState.max)
      t.update({ id: t.id, title: "Limits Updated", description: "Your offer limits have been updated." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Update Failed", description: e.shortMessage || "Error updating limits", variant: "destructive" })
    }
  }, [formState.min, formState.max, setLimits, toast])

  const handleSetTermsLocal = useCallback(async () => {
    if (!setTerms) return
    const t = toast({ title: "Updating Terms", description: "Waiting for wallet..." })
    try {
      await setTerms(formState.terms)
      t.update({ id: t.id, title: "Terms Updated", description: "Your offer terms have been updated." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Update Failed", description: e.shortMessage || "Error updating terms", variant: "destructive" })
    }
  }, [formState.terms, setTerms, toast])

  const handleToggleDisabledLocal = useCallback(async () => {
    if (!toggleDisabled) return
    const t = toast({ title: "Updating Status", description: "Waiting for wallet..." })
    try {
      await toggleDisabled()
      t.update({ id: t.id, title: "Status Updated", description: "Offer visibility has been changed." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Update Failed", description: e.shortMessage || "Error updating status", variant: "destructive" })
    }
  }, [toggleDisabled, toast])

  async function createOffer(val: any) {
    setLockSubmit(true)
    const t = toast({ title: "Publishing Offer", description: "Waiting for wallet..." })

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
      t.update({ id: t.id, title: "Offer Submitted", description: "Waiting for blockchain..." })

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
          t.update({ id: t.id, title: "Offer Created!", description: "Indexing and redirecting..." })
        }
      }
    } catch (e: any) {
      console.error('Submission error:', e)
      t.update({ id: t.id, title: "Submission Failed", description: e.shortMessage || "Error creating offer", variant: "destructive" })
      setLockSubmit(false)
    }
  }

  const form = {
    getFieldValue: (name: string) => formState[name],
    setFieldValue: (name: string, value: any) => setFormState((prev: any) => ({ ...prev, [name]: value })),
    getFieldsValue: () => formState,
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
    handleSetRate: handleSetRateLocal,
    handleSetLimits: handleSetLimitsLocal,
    handleSetTerms: handleSetTermsLocal,
    handleToggleDisabled: handleToggleDisabledLocal,
  }
}
