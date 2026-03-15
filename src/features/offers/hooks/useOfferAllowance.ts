import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { useAddress } from '@/shared/web3'
import { useReadErc20Allowance } from '@/wagmi'
import { type Offer } from './useOffer'

export function useOfferAllowance(offer: Offer | null, enabled: boolean = true) {
  const account = useAccount()
  const marketAddress = useAddress('Market#Market')

  const { data: allowanceValue, refetch: refetchAllowance } = useReadErc20Allowance({
    address: offer?.token?.address as Address,
    args: account.address && marketAddress ? [account.address, marketAddress as Address] : undefined,
    query: { enabled: enabled && !!offer && !!account.address && !!marketAddress && !offer.isSell },
  })

  const [allowance, setAllowance] = useState<bigint>(0n)
  useEffect(() => {
    if (allowanceValue !== undefined) {
      setAllowance(allowanceValue as bigint)
    }
  }, [allowanceValue])

  return {
    allowance,
    setAllowance,
    refetchAllowance,
  }
}
