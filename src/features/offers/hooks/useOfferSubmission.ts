import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { padHex, stringToHex, parseEventLogs } from 'viem'
import { message } from 'antd'
import { useWriteMarketCreateOffer, marketAbi } from '@/wagmi'
import { useAddress } from '@/shared/web3'
import type { OfferFormData, OfferParams } from '../types/offer'
import type { Token, Method } from '@/shared/web3'

interface UseOfferSubmissionParams {
  tokens: Record<string, Token>
  methods: Record<string, Method>
}

interface UseOfferSubmissionReturn {
  submitOffer: (values: OfferFormData) => Promise<string | undefined>
  isSubmitting: boolean
}

export function useOfferSubmission({
  tokens,
  methods,
}: UseOfferSubmissionParams): UseOfferSubmissionReturn {
  const publicClient = usePublicClient()
  const marketAddress = useAddress('Market#Market')
  const { writeContractAsync: createOfferTx } = useWriteMarketCreateOffer()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitOffer = useCallback(
    async (values: OfferFormData): Promise<string | undefined> => {
      setIsSubmitting(true)

      const params: OfferParams = {
        isSell: values.isSell,
        token: tokens[values.token].address,
        fiat: padHex(stringToHex(values.fiat), { size: 3, dir: 'right' }),
        methods: 1n << BigInt(methods[values.method].index),
        rate: Math.floor((1 + values.rate / 100) * 10 ** 4),
        limits: { min: Math.floor(values.min), max: Math.ceil(values.max) },
        terms: values.terms ?? '',
      }

      try {
        const hash = await createOfferTx({
          address: marketAddress,
          args: [params],
        })

        message.loading({
          content: 'Offer submitted. Waiting for confirmation...',
          key: 'createOffer',
          duration: 0,
        })

        const receipt = await publicClient?.waitForTransactionReceipt({ hash })

        if (receipt) {
          const logs = parseEventLogs({
            abi: marketAbi,
            eventName: 'OfferCreated',
            logs: receipt.logs,
          })

          if (logs.length > 0) {
            const offerAddress = logs[0].args.offer as `0x${string}`
            message.success({
              content: 'Offer confirmed! Syncing...',
              key: 'createOffer',
              duration: 2,
            })
            return offerAddress
          }
        }
      } catch (error: any) {
        console.error('Submission error:', error)
        message.error({
          content: error.shortMessage || error.message || 'Failed to submit offer',
          key: 'createOffer',
        })
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [tokens, methods, marketAddress, createOfferTx, publicClient]
  )

  return { submitOffer, isSubmitting }
}
