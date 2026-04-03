import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { decodeEventLog, Address, padHex, stringToHex } from 'viem'
import { usePublicClient } from 'wagmi'
import { useAddress } from '@/shared/web3'
import { useQueryOffer, type Offer } from '@/features/offers/hooks/useQueryOffer.ts'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'
import { marketAbi, useWriteOfferCreateDeal, useReadMarketGetPrice } from '@/wagmi'
import { normalizeMarketPrice } from '@/utils'

interface UseCreateDealProps {
  offer?: Offer | null
}

export function useCreateDeal(props: UseCreateDealProps = {}) {
  const { id: offerId } = useParams()
  const navigate = useNavigate()
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')

  const { offer: queriedOffer, isLoading: offerLoading } = useQueryOffer(props.offer ? undefined : offerId)
  const baseOffer = props.offer || queriedOffer

  const { data: marketPrice } = useReadMarketGetPrice({
    address: marketAddress,
    args:
      baseOffer && baseOffer.token
        ? [baseOffer.token.address as Address, padHex(stringToHex(baseOffer.fiat), { size: 3, dir: 'right' })]
        : undefined,
    query: {
      enabled: !!marketAddress && !!baseOffer && !!baseOffer.token,
      staleTime: 30000,
      select: (data): number => Number(data) / 1000000,
    },
  })

  const offer = useMemo(() => {
    if (!baseOffer) return null
    if (marketPrice === undefined) return baseOffer

    const price = normalizeMarketPrice(marketPrice)
    return {
      ...baseOffer,
      price: (price * baseOffer.rate).toFixed(2),
    }
  }, [baseOffer, marketPrice])

  const [lockButton, setLockButton] = useState(false)
  const [newDealAddress, setNewDealAddress] = useState<string | undefined>()
  const [formState, setFormState] = useState<any>({
    tokenAmount: '',
    fiatAmount: '',
    method: 0,
    paymentInstructions: ''
  })

  const { deals } = useUserDeals({ 
    pollInterval: newDealAddress ? 3000 : 0 
  })
  const createdDeal = deals?.find((d: any) => d.id.toLowerCase() === newDealAddress?.toLowerCase())
  const isSyncing = (!!newDealAddress && !createdDeal)

  useEffect(() => {
    if (newDealAddress && createdDeal && !isSyncing) {
      navigate(`/trade/deal/${newDealAddress}`)
    }
  }, [newDealAddress, createdDeal, isSyncing, navigate])

  const { writeContractAsync: createDealTx } = useWriteOfferCreateDeal()

  async function createDeal(values: any) {
    if (!offer || !marketAddress) return
    setLockButton(true)

    try {
      const amount = BigInt(Math.floor(values['fiatAmount'] * 10 ** 6))
      const hash = await createDealTx({
        address: offer.address,
        args: [
          {
            fiatAmount: amount,
            paymentInstructions: values['paymentInstructions'] ?? '',
            method: Number(values['method'] ?? 0),
          },
        ],
      })

      const receipt = await publicClient?.waitForTransactionReceipt({ hash })

      if (receipt) {
        for (const log of receipt.logs) {
          try {
            const event = decodeEventLog({
              abi: marketAbi,
              data: log.data,
              topics: log.topics,
            })
            if (event.eventName === 'DealCreated') {
              const dealAddress = (event.args as any).deal
              setNewDealAddress(dealAddress)
              break
            }
          } catch (e) {
            // skip logs that don't match marketAbi
          }
        }
      }
    } catch (e: any) {
      console.error('Failed to create deal', e)
    } finally {
      setLockButton(false)
    }
  }

  const syncTokenAmount = (fiat: string) => {
    if (!offer || !(offer as any).price) return
    const value = fiat.length > 0 ? (Number(fiat) / Number((offer as any).price)).toFixed(8) : ''
    setFormState((prev: any) => ({ ...prev, tokenAmount: value, fiatAmount: fiat }))
  }

  const syncFiatAmount = (token: string) => {
    if (!offer || !(offer as any).price) return
    const value = token.length > 0 ? (Number(token) * Number((offer as any).price)).toFixed(2) : ''
    setFormState((prev: any) => ({ ...prev, fiatAmount: value, tokenAmount: token }))
  }

  const form = {
    getFieldProps: (name: string) => ({
      value: formState[name],
      onChange: (e: any) => {
        const val = e.target.value
        setFormState((prev: any) => ({ ...prev, [name]: val }))
        if (name === 'fiatAmount') syncTokenAmount(val)
        if (name === 'tokenAmount') syncFiatAmount(val)
      }
    }),
    getFieldsValue: () => formState,
    setFieldValue: (name: string, value: any) => setFormState((prev: any) => ({ ...prev, [name]: value })),
    getFieldError: (name: string) => null,
    validateFields: (names: string[]) => Promise.resolve(),
  }

  let submitLabel = 'Open Deal'
  let submitDisabled = false

  if (offer && offer.disabled) {
    submitLabel = 'Offer is disabled'
    submitDisabled = true
  }

  return {
    offer,
    form,
    lockButton: lockButton || !!newDealAddress,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
    isLoading: offerLoading
  }
}
