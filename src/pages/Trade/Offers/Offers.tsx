
import { useParams } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { message } from 'antd'
import { useOffers } from '@/hooks/useOffers'
import OffersTable from '@/pages/Trade/Offers/OffersTable'
import OffersFilters from '@/pages/Trade/Offers/OffersFilters'
import TokenNav from '@/pages/Trade/Offers/TokenNav'
import { useAddress } from '@/hooks/useAddress'
import { useReadMarketGetPrice } from '@/wagmi'

export default function Offers({ filter: superFilter = null }) {
  const marketAddress = useAddress('Market#Market')

  /**
   * Fetch offers from the GraphQL. It then must calculate price and be filtered by amount.
   */
  const { side = 'sell', token = 'WETH', fiat = 'USD', method = undefined } = useParams()
  const {
    offers: rawOffers,
    totalCount,
    loadMore,
    refetch,
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
      // noinspection JSIgnoredPromiseFromCall
      message.error('Failed to load offers')
    }
  }, [error])


  /**
   * Fetch market price of token in fiat and apply to offer rates.
   */
  const [allOffers, setAllOffers] = useState(null)
  const {
    data: marketPrice,
    isLoading: priceLoading,
    error: priceError,
  } = useReadMarketGetPrice({
    address: marketAddress,
    args: [token, fiat],
    query: {
      enabled: !!marketAddress,
      staleTime: 30000,
      select: (data) => Number(data) / 10000 / 100,
    },
  })
  useEffect(() => {
    if (priceError) {
      console.error(priceError)
      // noinspection JSIgnoredPromiseFromCall
      message.error('Failed to load price')
    }
  }, [priceError])
  useEffect(() => {
    if (!rawOffers || !marketPrice) return
    const offers = rawOffers.map((offer) => {
      const rate = Number(offer.rate) / 10 ** 4
      return {
        ...offer,
        rate: rate,
        price: (marketPrice * rate).toFixed(2),
      }
    })
    setAllOffers(offers)
  }, [rawOffers, marketPrice])

  /**
   * Construct the final offers list, filtered locally.
   */
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

  return (
    <>
      <TokenNav />
      <OffersFilters setFilterAmount={setFilterAmount} />
      <OffersTable
        offers={offers || []}
        loading={!error && !priceError && (offers === null || listLoading || priceLoading)}
        loadMore={loadMore}
        totalOffers={totalCount}
      />
    </>
  )
}
