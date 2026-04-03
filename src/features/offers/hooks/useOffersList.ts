import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryOffers } from '@/features/offers/hooks/useQueryOffers'
import { useAddress } from '@/shared/web3'
import { useInventory, decodeMethod } from '@/shared/web3'
import { useReadMarketGetPrice } from '@/wagmi'
import { Address, padHex, stringToHex, hexToString, trim } from 'viem'
import { normalizeMarketPrice } from '@/utils'

export function useOffersList({ superFilter = null }: { superFilter?: any } = {}) {
  const marketAddress = useAddress('Market#Market')
  const {
    side = 'sell',
    token: tokenSymbol = 'WETH',
    fiat: fiatSymbol = 'USD',
    method: methodName = undefined,
  } = useParams()
  const { tokens, fiats, methods, loading: invLoading } = useInventory()

  const [filterAmount, setFilterAmount] = useState<string>('')

  const activeToken = tokens[tokenSymbol]
  const activeFiat = fiats[fiatSymbol]
  const activeMethod = methodName ? methods[methodName] : undefined

  const filter = useMemo(() => {
    if (superFilter) return superFilter

    const f: any = {
      disabled: false,
      isSell: side.toLowerCase() === 'buy',
    }

    if (activeToken) f.token = activeToken.id
    if (fiatSymbol) f.fiat = padHex(stringToHex(fiatSymbol), { size: 3, dir: 'right' })

    if (filterAmount !== '') {
      const amount = parseInt(filterAmount)
      if (!isNaN(amount)) {
        f.minFiat_lte = amount
        f.maxFiat_gte = amount
      }
    }

    return f
  }, [superFilter, side, activeToken, activeFiat, activeMethod, filterAmount])

  const {
    offers: rawOffers,
    totalCount,
    loadMore,
    loading: listLoading,
    error,
  } = useQueryOffers({
    filter: filter,
    order: side === 'buy' ? 'asc' : 'desc',
  })

  useEffect(() => {
    if (error) {
      console.error(error.message)
    }
  }, [error])

  const {
    data: marketPrice,
    isLoading: priceLoading,
    error: priceError,
  } = useReadMarketGetPrice({
    address: marketAddress,
    args:
      activeToken && activeFiat
        ? [activeToken.address as Address, padHex(stringToHex(fiatSymbol), { size: 3, dir: 'right' })]
        : undefined,
    query: {
      enabled: !!marketAddress && !!activeToken && !!activeFiat,
      staleTime: 30000,
      select: (data): number => Number(data) / 1000000,
    },
  })

  useEffect(() => {
    if (priceError) {
      console.error(priceError)
    }
  }, [priceError])

  const offers = useMemo(() => {
    if (!rawOffers || marketPrice === undefined) return []
    const price = normalizeMarketPrice(marketPrice)

    const filteredOffers = activeMethod
      ? rawOffers.filter((offer) => {
          const mask = BigInt(offer.methods || 0)
          const targetBit = 1n << BigInt(activeMethod.index)
          return (mask & targetBit) !== 0n
        })
      : rawOffers

    return filteredOffers.map((offer) => {
      const rate = Number(offer.rate) / 10000

      return {
        ...offer,
        fiat: hexToString(trim((offer.fiat as Address) || '0x00', { dir: 'right' })),
        rate: rate,
        price: (price * rate).toFixed(2),
        method: decodeMethod(offer.methods, methods),
      }
    })
  }, [rawOffers, marketPrice, methods])

  return {
    offers,
    loading: !error && !priceError && (listLoading || priceLoading || invLoading),
    loadMore,
    totalOffers: totalCount,
    filterAmount,
    setFilterAmount,
  }
}
