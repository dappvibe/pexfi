import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useContract } from '@/hooks/useContract'
import OfferModel from '@/model/Offer.js'
import { ERC20, Offer } from '@/types'

interface UseOfferOptions {
  fetchPrice?: boolean
  fetchAllowance?: boolean
}

export function useOffer(offerId: string | undefined, { fetchPrice = false, fetchAllowance = false }: UseOfferOptions = {}) {
  const chainId = useChainId()
  const account = useAccount()
  const { Market, Offer: OfferContract, Token, signed } = useContract()
  const [offer, setOffer] = useState<OfferModel | null>(null)
  const [allowance, setAllowance] = useState(0)
  const token = useRef<ERC20 | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => {
    setRefetchTrigger((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!offerId) {
      setOffer(null)
      return
    }

    let promise = OfferModel.fetch(OfferContract.attach(offerId))

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
  }, [offerId, chainId, account?.address, fetchPrice, fetchAllowance, Market, OfferContract, Token, refetchTrigger])

  const setRate = useCallback(async (rate: number) => {
    if (!offer) throw new Error('No offer')
    const rateInt = Math.floor((1 + rate / 100) * 10 ** 4)
    if (Math.floor(offer.rate * 10 ** 4) === rateInt) return

    const o = (await signed(OfferContract.attach(offer.address))) as Offer
    const tx = await o.setRate(rateInt)
    await tx.wait()
    refetch()
  }, [offer, signed, OfferContract, refetch])

  const setLimits = useCallback(async (min: number, max: number) => {
    if (!offer) throw new Error('No offer')
    const minInt = Math.floor(min)
    const maxInt = Math.ceil(max)
    const o = (await signed(OfferContract.attach(offer.address))) as Offer
    // @ts-ignore generated LimitsStruct is wrong, an array works
    const tx = await o.setLimits([minInt, maxInt])
    await tx.wait()
    refetch()
  }, [offer, signed, OfferContract, refetch])

  const setTerms = useCallback(async (terms: string) => {
    if (!offer) throw new Error('No offer')
    const o = (await signed(OfferContract.attach(offer.address))) as Offer
    const tx = await o.setTerms(terms)
    await tx.wait()
    refetch()
  }, [offer, signed, OfferContract, refetch])

  const toggleDisabled = useCallback(async () => {
    if (!offer) throw new Error('No offer')
    const o = (await signed(OfferContract.attach(offer.address))) as Offer
    const tx = await o.setDisabled(!offer.disabled)
    await tx.wait()
    refetch()
  }, [offer, signed, OfferContract, refetch])

  return {
    offer,
    allowance,
    setAllowance,
    token: token.current,
    refetch,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled
  }
}
