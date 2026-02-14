import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { Address } from 'viem'
import { profileAbi } from '@/wagmi'
import { useAddress } from '@/hooks/useAddress'

export type Profile = {
  address: Address
  balance: bigint
  upvotes: bigint
  downvotes: bigint
  rating: number
  dealsCompleted: number
}

export function useProfile(address: Address | undefined) {
  const profileAddress = useAddress('Profile#Profile')

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts:
      profileAddress && address
        ? [
            { address: profileAddress, abi: profileAbi, functionName: 'balanceOf', args: [address] },
            { address: profileAddress, abi: profileAbi, functionName: 'upvotes', args: [address] },
            { address: profileAddress, abi: profileAbi, functionName: 'downvotes', args: [address] },
          ]
        : [],
    query: { enabled: !!profileAddress && !!address },
  })

  const profile = useMemo<Profile | null>(() => {
    if (!data || !address) return null
    const balance = data[0]?.result as bigint | undefined
    const upvotes = data[1]?.result as bigint | undefined
    const downvotes = data[2]?.result as bigint | undefined
    if (balance === undefined) return null

    const total = Number(upvotes ?? 0n) + Number(downvotes ?? 0n)
    return {
      address,
      balance,
      upvotes: upvotes ?? 0n,
      downvotes: downvotes ?? 0n,
      rating: total > 0 ? Number(upvotes ?? 0n) / total : 0,
      dealsCompleted: Number(balance / BigInt(1e18)),
    }
  }, [data, address])

  return { profile, isLoading, error, refetch }
}
