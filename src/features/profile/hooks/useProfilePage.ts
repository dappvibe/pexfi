import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useConfig } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import { waitForTransactionReceipt } from '@wagmi/core'
import {
  useWriteProfileRegister,
  useWriteProfileUpdateInfo,
} from '@/wagmi'
import { useAddress } from '@/shared/web3'
import { useQueryProfile } from '@/features/profile/hooks/useQueryProfile'

export type ProfileStats = {
  createdAt: Date
  info: string | null
  upvotes: number
  downvotes: number
  dealsCompleted: number
  disputesLost: number
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
  const { writeContractAsync: updateInfoContract } = useWriteProfileUpdateInfo()

  const stats = useMemo<ProfileStats | null>(() => {
    if (!profile) return null
    return {
      upvotes: profile.upvotes,
      downvotes: profile.downvotes,
      dealsCompleted: profile.dealsCompleted,
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

  async function updateInfo(newInfo: string) {
    if (!profileAddress || !profile) return
    const hash = await updateInfoContract({
      address: profileAddress,
      args: [BigInt(profile.tokenId), newInfo],
    })
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
    tokenId: profile ? BigInt(profile.tokenId) : null,
    profile,
    stats,
    isOwnProfile: !profileParam,
    create,
    updateInfo,
    rating,
    loading: isProfileLoading,
  }
}
