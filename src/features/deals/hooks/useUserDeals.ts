import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import Deal from '@/model/Deal.js'
import Offer from '@/model/Offer.js'
import { useContract } from '@/hooks/useContract'

export function useUserDeals() {
  const { address } = useAccount()
  const { Market, Deal: DealContract, Offer: OfferContract } = useContract()
  const [deals, setDeals] = useState<any[] | undefined>(undefined)

  useEffect(() => {
    if (!address) return

    Promise.all([
      Market.queryFilter(Market.filters.DealCreated(address)), // as maker
      Market.queryFilter(Market.filters.DealCreated(null, address)), // as taker
    ]).then(([asOwner, asTaker]) => {
      const fetching = asOwner.concat(asTaker).map((log) =>
        new Deal(DealContract.attach(log.args[3])).fetch().then((deal) =>
          Market.runner
            .getBlock(log.blockHash)
            .then((block) => {
              deal.createdAt = block
              return deal
            })
            .then((deal) =>
              Offer.fetch(OfferContract.attach(deal.offer)).then((offer) => {
                deal.offer = offer
                return Market.token(offer.token).then((token) => {
                  deal.tokenAmount /= 10 ** Number(token.decimals)
                  return deal
                })
              })
            )
        )
      )
      Promise.all(fetching).then(setDeals)
    })
  }, [address])

  return { deals }
}
