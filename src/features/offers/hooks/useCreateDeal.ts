import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import { Address, decodeEventLog } from 'viem'
import { usePublicClient } from 'wagmi'
import { useAddress } from '@/shared/web3'
import { type Offer } from '@/features/offers/hooks/useOffer'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'
import { marketAbi, useWriteErc20Approve, useWriteOfferCreateDeal } from '@/wagmi'

interface UseCreateDealProps {
  offer: Offer | null
}

export function useCreateDeal({ offer }: UseCreateDealProps) {
  const navigate = useNavigate()
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')

  const [form] = Form.useForm()
  const [lockButton, setLockButton] = useState(false)
  const [newDealAddress, setNewDealAddress] = useState<string | undefined>()

  const { deals, loading: isSyncingDeals } = useUserDeals({ pollInterval: 1000 })
  const createdDeal = deals?.find((d: any) => d.id.toLowerCase() === newDealAddress?.toLowerCase())
  const isSyncing = isSyncingDeals || (!!newDealAddress && !createdDeal)

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
      message.loading({ content: 'Deal submitted. Waiting for confirmation...', key: 'createDeal', duration: 0 })
      const hash = await createDealTx({
        address: offer.address,
        args: [
          marketAddress as Address,
          {
            fiatAmount: amount,
            paymentInstructions: values['paymentInstructions'] ?? '',
            method: 0, // TODO: handle method selection if needed
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
              message.success({ content: 'Deal created! Syncing...', key: 'createDeal', duration: 2 })
              break
            }
          } catch (e) {
            // skip logs that don't match marketAbi
          }
        }
      }
    } catch (e: any) {
      message.error({
        content: e.shortMessage || 'Failed to create deal',
        key: 'createDeal',
      })
    } finally {
      setLockButton(false)
    }
  }

  const syncTokenAmount = (fiat: string) => {
    if (!offer || !offer.price) return
    const value = fiat.length > 0 ? (Number(fiat) / Number(offer.price)).toFixed(8) : ''
    form.setFieldValue('tokenAmount', value)
  }

  const syncFiatAmount = (token: string) => {
    if (!offer || !offer.price) return
    const value = token.length > 0 ? (Number(token) * Number(offer.price)).toFixed(2) : ''
    form.setFieldValue('fiatAmount', value)
    form.validateFields(['fiatAmount'])
  }

  let submitLabel = 'Open Deal'
  let submitDisabled = false // Caller should handle account check if needed, or we can keep it here

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
