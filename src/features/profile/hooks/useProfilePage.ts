import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useConfig } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import { waitForTransactionReceipt } from '@wagmi/core'
import {
  useWriteProfileRegister,
} from '@/wagmi'
import { useAddress } from '@/shared/web3'
import { useQueryProfile } from '@/features/profile/hooks/useQueryProfile'

export type ProfileStats = {
  createdAt: Date
  info: string | null
  upvotes: number
  downvotes: number
  volumeUSD: number
  dealsCompleted: number
  dealsExpired: number
  disputesLost: number
  avgPaymentTime: number
  avgReleaseTime: number
}

export function useProfilePage() {
  const { address: connectedAddress } = useAccount()
  const activeAccount = useActiveAccount()
  const { profile: profileParam } = useParams()
  const address = (profileParam as `0x${string}`) || connectedAddress || activeAccount?.address
  const profileAddress = useAddress('Market#Profile')

  const config = useConfig()

  const { profile, loading: isProfileLoading, refetch: refetchProfile } = useQueryProfile(address)

  const { writeContractAsync: register } = useWriteProfileRegister()

  const stats = useMemo<ProfileStats | null>(() => {
    if (!profile) return null
    return {
      upvotes: profile.upvotes,
      downvotes: profile.downvotes,
      volumeUSD: profile.volumeUSD,
      avgPaymentTime: profile.avgPaymentTime,
      avgReleaseTime: profile.avgReleaseTime,
      dealsCompleted: profile.dealsCompleted,
      dealsExpired: profile.dealsExpired,
      disputesLost: profile.disputesLost,
      info: profile.info,
      createdAt: new Date(profile.createdAt * 1000),
    }
  }, [profile])

  async function create() {
    if (!profileAddress) return
    const hash = await register({ address: profileAddress })
    await waitForTransactionReceipt(config, { hash })
    await refetchProfile()
  }

  function rating(upvotes: number, downvotes: number) {
    const totalVotes = upvotes + downvotes
    if (totalVotes === 0) return '-'
    return `${((upvotes / totalVotes) * 100).toFixed(2)}%`
  }

  return {
    address,
    tokenId: profile ? BigInt(profile.id) : null,
    stats,
    isOwnProfile: !profileParam,
    create,
    rating,
    loading: isProfileLoading,
  }
}
