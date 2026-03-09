import { useCallback, useMemo, useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { Address, padHex, hexToString, trim } from 'viem'
import { normalizeMarketPrice } from '@/utils'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useAddress, useInventory, decodeMethod, type Token } from '@/shared/web3'
import {
  useReadMarketGetPrice,
  useReadErc20Allowance,
  useWriteOfferSetRate,
  useWriteOfferSetLimits,
  useWriteOfferSetTerms,
  useWriteOfferSetDisabled,
} from '@/wagmi'


export type Offer = {
  id: string
  address: Address
  owner: Address
  isSell: boolean
  token: Token | null
  fiat: string
  method: string // bitmask as string for compatibility
  rate: number // normalized rate (e.g. 0.01 for 1%)
  min: number
  max: number
  terms: string
  disabled: boolean
  price?: string // calculated price
}

const GQL_OFFER = gql`
  query Offer($id: ID!) {
    offer(id: $id) {
      id
      owner
      isSell
      token {
        id
        address
        name
        symbol
        decimals
      }
      fiat
      methods
      rate
      minFiat
      maxFiat
      terms
      disabled
    }
  }
`

interface UseOfferOptions {
  fetchPrice?: boolean
  fetchAllowance?: boolean
  pollInterval?: number
}

interface RawToken {
  id: string
  address: string
  name: string
  symbol: string
  decimals: number
}

interface RawOffer {
  id: string
  owner: string
  isSell: boolean
  token: RawToken | null
  fiat: string
  methods: string
  rate: number
  minFiat: number
  maxFiat: number
  terms: string
  disabled: boolean
}

interface OfferQueryResult {
  offer: RawOffer | null
}

export function useOffer(offerId: string | undefined, options: UseOfferOptions = {}) {
  const { fetchPrice = false, fetchAllowance = false, pollInterval = 0 } = options
  const account = useAccount()
  const marketAddress = useAddress('Market#Market')
  const { methods } = useInventory()

  const { data, loading, error, refetch, stopPolling } = useQuery<OfferQueryResult>(GQL_OFFER, {
    variables: { id: offerId?.toLowerCase() },
    skip: !offerId,
    pollInterval,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling()
      }
    }
  }, [stopPolling])

  const rawOffer = data?.offer

  // Fetch price if needed
  const { data: marketPrice } = useReadMarketGetPrice({
    address: marketAddress as Address,
    args: rawOffer
      ? [rawOffer.token.address as Address, padHex(rawOffer.fiat as `0x${string}`, { size: 3, dir: 'right' })]
      : undefined,
    query: { enabled: fetchPrice && !!rawOffer && !!marketAddress },
  })

  // Fetch allowance if needed
  const { data: allowanceValue, refetch: refetchAllowance } = useReadErc20Allowance({
    address: rawOffer?.token.address as Address,
    args: account.address && marketAddress ? [account.address, marketAddress as Address] : undefined,
    query: { enabled: fetchAllowance && !!rawOffer && !!account.address && !!marketAddress && !rawOffer.isSell },
  })

  const [allowance, setAllowance] = useState<bigint>(0n)
  useEffect(() => {
    if (allowanceValue !== undefined) {
      setAllowance(allowanceValue as bigint)
    }
  }, [allowanceValue])

  const offer = useMemo<Offer | null>(() => {
    if (!rawOffer) return null

    const normalizedRate = rawOffer.rate / 10000
    let price: string | undefined
    if (marketPrice !== undefined) {
      const basePrice = normalizeMarketPrice(marketPrice as bigint)
      price = (basePrice * normalizedRate).toFixed(3)
    }


    return {
      id: rawOffer.id,
      address: rawOffer.id as Address,
      owner: rawOffer.owner as Address,
      isSell: rawOffer.isSell,
      token: rawOffer.token
        ? {
            id: rawOffer.token.id,
            address: rawOffer.token.address as Address,
            name: rawOffer.token.name,
            symbol: rawOffer.token.symbol,
            decimals: rawOffer.token.decimals,
          }
        : null,
      fiat: hexToString(trim(rawOffer.fiat as `0x${string}`, { dir: 'right' })),
      method: decodeMethod(rawOffer.methods, methods),
      rate: normalizedRate,
      min: rawOffer.minFiat,
      max: rawOffer.maxFiat,
      terms: rawOffer.terms,
      disabled: rawOffer.disabled,
      price,
    }
  }, [rawOffer, marketPrice, methods])

  // Write hooks
  const { writeContractAsync: setRateTx } = useWriteOfferSetRate()
  const { writeContractAsync: setLimitsTx } = useWriteOfferSetLimits()
  const { writeContractAsync: setTermsTx } = useWriteOfferSetTerms()
  const { writeContractAsync: setDisabledTx } = useWriteOfferSetDisabled()
  const publicClient = usePublicClient()

  const setRate = useCallback(
    async (rate: number) => {
      if (!offerId) return
      const hash = await setRateTx({
        address: offerId as Address,
        args: [Math.floor(rate * 10000)],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      // Small delay to allow subgraph to pick up the change
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setRateTx, refetch, publicClient]
  )

  const setLimits = useCallback(
    async (min: number, max: number) => {
      if (!offerId) return
      const hash = await setLimitsTx({
        address: offerId as Address,
        args: [{ min: Math.floor(min), max: Math.floor(max) }],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setLimitsTx, refetch, publicClient]
  )

  const setTerms = useCallback(
    async (terms: string) => {
      if (!offerId) return
      const hash = await setTermsTx({
        address: offerId as Address,
        args: [terms],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refetch()
    },
    [offerId, setTermsTx, refetch, publicClient]
  )

  const toggleDisabled = useCallback(async () => {
    if (!offerId || !offer) return
    const hash = await setDisabledTx({
      address: offerId as Address,
      args: [!offer.disabled],
    })
    await publicClient?.waitForTransactionReceipt({ hash })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await refetch()
  }, [offerId, offer, setDisabledTx, refetch, publicClient])

  return {
    offer,
    allowance,
    setAllowance,
    isLoading: loading,
    error,
    refetch,
    refetchAllowance,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  }
}
