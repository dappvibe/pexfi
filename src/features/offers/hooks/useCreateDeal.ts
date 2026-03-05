import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message } from 'antd'
import { Address, decodeEventLog } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'
import { useAddress } from '@/shared/web3'
import { useOffer } from '@/features/offers/hooks/useOffer'
import { useDeal } from '@/features/deals/hooks/useDeal'
import { marketAbi, useWriteErc20Approve, useWriteOfferCreateDeal } from '@/wagmi'

export function useCreateDeal() {
  const navigate = useNavigate()
  const account = useAccount()
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')

  const { offerId } = useParams()
  const {
    offer,
    allowance,
    refetchAllowance,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  } = useOffer(offerId, {
    fetchPrice: true,
    fetchAllowance: true,
    pollInterval: 2000,
  })

  const [form] = Form.useForm()
  const [lockButton, setLockButton] = useState(false)
  const [newDealAddress, setNewDealAddress] = useState<string | undefined>()

  const { deal: createdDeal, isLoading: isSyncing } = useDeal(newDealAddress, { pollInterval: 1000 })

  useEffect(() => {
    if (newDealAddress && createdDeal && !isSyncing) {
      navigate(`/trade/deal/${newDealAddress}`)
    }
  }, [newDealAddress, createdDeal, isSyncing, navigate])

  const { writeContractAsync: approveTx } = useWriteErc20Approve()
  const { writeContractAsync: createDealTx } = useWriteOfferCreateDeal()

  const isOwner = !!account.address && !!offer && offer.owner.toLowerCase() === account.address.toLowerCase()

  async function approve() {
    if (!offer || allowance > 0n || offer.isSell) return

    try {
      const hash = await approveTx({
        address: offer.token?.address as Address,
        args: [marketAddress as Address, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await refetchAllowance()
    } catch (e: any) {
      message.error(e.shortMessage || 'Approval failed')
      throw e
    }
  }

  async function createDeal(_offer: any, values: any) {
    if (!offer || !marketAddress) return
    setLockButton(true)

    try {
      await approve()

      const amount = BigInt(Math.floor(values['fiatAmount'] * 10 ** 6))
      const hash = await createDealTx({
        address: offer.address,
        args: [
          marketAddress as Address,
          {
            fiatAmount: amount,
            paymentInstructions: values['paymentInstructions'] ?? '',
            method: 0, // TODO: handle method selection if needed, current implementation had it hardcoded or missing in params
          },
        ],
      })

      message.info('Deal submitted. Waiting for confirmation...')
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
      message.error(e.shortMessage || 'Failed to create deal')
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
  let submitDisabled = !account.address
  if (offer && !offer.isSell && !allowance) {
    submitLabel = `Approve ${offer.token?.symbol}`
  }
  if (offer && offer.disabled) {
    submitLabel = 'Offer is disabled'
    submitDisabled = true
  }

  return {
    offer,
    form,
    isOwner,
    lockButton: lockButton || !!newDealAddress,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  }
}
