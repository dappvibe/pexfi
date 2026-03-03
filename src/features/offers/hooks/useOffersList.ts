import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { useOffers } from '@/features/offers/hooks/useOffers'
import { useAddress } from '@/hooks/useAddress'
import { useReadMarketGetPrice } from '@/wagmi'

export function useOffersList({ superFilter = null }: { superFilter?: any } = {}) {
  const marketAddress = useAddress('Market#Market')
  const { side = 'sell', token = 'WETH', fiat = 'USD', method = undefined } = useParams()

  const {
    offers: rawOffers,
    totalCount,
    loadMore,
    loading: listLoading,
    error,
  } = useOffers({
    filter: superFilter || {
      disabled: false,
      isSell: side.toLowerCase() === 'buy',
      token: token,
      fiat: fiat,
      method: method,
    },
    order: side === 'buy' ? 'asc' : 'desc',
  })

  useEffect(() => {
    if (error) {
      console.error(error.message)
      message.error('Failed to load offers')
    }
  }, [error])

  const [allOffers, setAllOffers] = useState(null)
  const {
    data: marketPrice,
    isLoading: priceLoading,
    error: priceError,
  } = useReadMarketGetPrice({
    address: marketAddress,
    args: [token as `0x${string}`, fiat as `0x${string}`],
    query: {
      enabled: !!marketAddress,
      staleTime: 30000,
      select: (data): number => Number(data) / 10000 / 100,
    },
  })

  useEffect(() => {
    if (priceError) {
      console.error(priceError)
      message.error('Failed to load price')
    }
  }, [priceError])

  useEffect(() => {
    if (!rawOffers || !marketPrice) return
    const price = marketPrice as unknown as number
    const offers = rawOffers.map((offer) => {
      const rate = Number(offer.rate) / 10 ** 4
      return {
        ...offer,
        rate: rate,
        price: (price * rate).toFixed(2),
      }
    })
    setAllOffers(offers)
  }, [rawOffers, marketPrice])

  const [offers, setOffers] = useState(null)
  const [filterAmount, setFilterAmount] = useState('')

  useEffect(() => {
    if (!allOffers) return
    if (filterAmount === '') {
      setOffers(allOffers)
    } else {
      setOffers(allOffers.filter((offer) => offer.minFiat <= filterAmount && offer.maxFiat >= filterAmount))
    }
  }, [filterAmount, allOffers])

  return {
    offers: offers || [],
    loading: !error && !priceError && (offers === null || listLoading || priceLoading),
    loadMore,
    totalOffers: totalCount,
    filterAmount,
    setFilterAmount,
  }
}
