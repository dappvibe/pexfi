import { useEffect, useRef, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import Offer from '@/model/Offer.js'
import { ERC20 } from '@/types'

export function useOffer(offerId, { fetchPrice = false, fetchAllowance = false } = {}) {
  const chainId = useChainId()
  const account = useAccount()
  const { Market, Offer: OfferContract, Token } = useContract()
  const [offer, setOffer] = useState(null)
  const [allowance, setAllowance] = useState(0)
  const token = useRef<ERC20 | null>(null)

  useEffect(() => {
    if (!offerId) {
      setOffer(null)
      return
    }

    let promise = Offer.fetch(OfferContract.attach(offerId))

    if (fetchPrice) {
      promise = promise.then((offer) => {
        if (!offer) return null
        return Market.getPrice(offer.token, offer.fiat).then((price) => {
          offer.setPairPrice(price)
          return offer
        })
      })
    }

    promise = promise.then((offer) => {
      if (!offer || !account.address || offer.isSell || !fetchAllowance) {
        return offer
      }

      return Market.token(offer.token).then(([address]) => {
        token.current = Token.attach(address) as ERC20
        return token.current.allowance(account.address, Market.target).then((res) => {
          setAllowance(res)
          return offer
        })
      })
    })

    promise.then(setOffer)
  }, [offerId, chainId, account?.address, fetchPrice, fetchAllowance, Market, OfferContract, Token])

  return { offer, allowance, setAllowance, token: token.current }
}
