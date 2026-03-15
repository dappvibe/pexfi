import { useMemo } from 'react'
import { Address, padHex, stringToHex, hexToString, trim } from 'viem'
import { useReadMarketGetPrice } from '@/wagmi'
import { normalizeMarketPrice } from '@/utils'
import { useAddress } from '@/shared/web3'

export function useOfferPrice(offer: { token?: { address: string } | null, fiat: string, rate: number } | null | undefined, enabled: boolean = true) {
  const marketAddress = useAddress('Market#Market')

  let marketArgs: [Address, Address] | undefined
  if (offer && offer.token) {
    marketArgs = [offer.token.address as Address, padHex(stringToHex(offer.fiat), { size: 3, dir: 'right' })]
  }

  const { data: marketPrice, isLoading, error } = useReadMarketGetPrice({
    address: marketAddress as Address,
    args: marketArgs,
    query: { enabled: enabled && !!marketArgs && !!marketAddress },
  })

  const price = useMemo<string | undefined>(() => {
    if (!offer || marketPrice === undefined) return undefined
    const basePrice = normalizeMarketPrice(marketPrice as bigint)
    return (basePrice * offer.rate).toFixed(3)
  }, [offer, marketPrice])

  return { price, marketPrice, isLoading, error }
}
