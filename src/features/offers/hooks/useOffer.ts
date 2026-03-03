import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { padHex } from 'viem'
import { useContract } from '@/shared/web3'
import OfferModel from '@/model/Offer.js'
import { ERC20, Offer } from '@/types'

import { abi as ERC20Abi } from '@artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json'
import { ethers } from 'ethers'

interface UseOfferOptions {
  fetchPrice?: boolean
  fetchAllowance?: boolean
}

export function useOffer(offerId: string, options: UseOfferOptions = {}) {
  const { fetchPrice = false, fetchAllowance = false } = options
  const [offer, setOffer] = useState<any>(null)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const token = useRef<ERC20 | null>(null)
  const chainId = useChainId()
  const account = useAccount()
  const { signed, Market, Offer: OfferContract, Token } = useContract()

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!offerId) {
      setOffer(null)
      return
    }

    const fetchData = async () => {
      try {
        const offer = await OfferModel.fetch(OfferContract.attach(offerId))
        if (!offer) {
          setOffer(null)
          return
        }

        const promises = []

        if (fetchPrice) {
          const fiatBytes3 = padHex(offer.fiat as `0x${string}`, { size: 3, dir: 'right' })
          promises.push(
            Market.getPrice(offer.token, fiatBytes3).then((price) => {
              offer.setPairPrice(price)
            })
          )
        }

        if (fetchAllowance && account.address && !offer.isSell) {
          token.current = new ethers.Contract(offer.token, ERC20Abi, Market.runner) as unknown as ERC20
          promises.push(
            token.current.allowance(account.address, Market.target).then((res) => {
              setAllowance(res)
            })
          )
        }

        await Promise.all(promises)
        setOffer(offer)
      } catch (e) {
        console.error('useOffer fetch error:', e)
        setOffer(null)
      }
    }

    fetchData()
  }, [offerId, chainId, account?.address, fetchPrice, fetchAllowance, Market, OfferContract, Token, refetchTrigger])

  const setRate = useCallback(
    async (rate: number) => {
      if (!offer) return
      const contract = (await signed(OfferContract.attach(offer.address))) as Offer
      const tx = await contract.setRate(Math.floor(rate * 10 ** 4))
      await tx.wait()
      refetch()
    },
    [offer, signed, OfferContract, refetch]
  )

  const setLimits = useCallback(
    async (min: number, max: number) => {
      if (!offer) return
      const contract = (await signed(OfferContract.attach(offer.address))) as Offer
      const tx = await contract.setLimits({ min: BigInt(min), max: BigInt(max) })
      await tx.wait()
      refetch()
    },
    [offer, signed, OfferContract, refetch]
  )

  const setTerms = useCallback(
    async (terms: string) => {
      if (!offer) return
      const contract = (await signed(OfferContract.attach(offer.address))) as Offer
      const tx = await contract.setTerms(terms)
      await tx.wait()
      refetch()
    },
    [offer, signed, OfferContract, refetch]
  )

  const toggleDisabled = useCallback(async () => {
    if (!offer) return
    const contract = (await signed(OfferContract.attach(offer.address))) as Offer
    const tx = await contract.setDisabled(!offer.disabled)
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
    toggleDisabled,
  }
}
