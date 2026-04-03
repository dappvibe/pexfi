import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'
import { useAddress } from '@/shared/web3'
import { type Offer } from '@/features/offers/hooks/useQueryOffer.ts'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'
import { marketAbi, useWriteOfferCreateDeal } from '@/wagmi'

interface UseCreateDealProps {
  offer: Offer | null
}

export function useCreateDeal({ offer }: UseCreateDealProps) {
  const navigate = useNavigate()
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')

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
    if (!offer || !offer.price) return
    const value = fiat.length > 0 ? (Number(fiat) / Number(offer.price)).toFixed(8) : ''
    setFormState((prev: any) => ({ ...prev, tokenAmount: value, fiatAmount: fiat }))
  }

  const syncFiatAmount = (token: string) => {
    if (!offer || !offer.price) return
    const value = token.length > 0 ? (Number(token) * Number(offer.price)).toFixed(2) : ''
    setFormState((prev: any) => ({ ...prev, fiatAmount: value, tokenAmount: token }))
  }

  const form = {
    getFieldProps: (name: string) => ({
      value: formState[name],
      onChange: (e: any) => setFormState((prev: any) => ({ ...prev, [name]: e.target.value }))
    }),
    getFieldsValue: () => formState,
    setFieldValue: (name: string, value: any) => setFormState((prev: any) => ({ ...prev, [name]: value })),
    getFieldError: (name: string) => null, // Simplified
    validateFields: (names: string[]) => Promise.resolve(), // Simplified
  }

  let submitLabel = 'Open Deal'
  let submitDisabled = false

  if (offer && offer.disabled) {
    submitLabel = 'Offer is disabled'
    submitDisabled = true
  }

  return {
    form,
    lockButton: lockButton || !!newDealAddress,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
  }
}
