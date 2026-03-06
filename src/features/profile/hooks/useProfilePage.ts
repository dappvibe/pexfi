import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount, useConfig } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import {
  useReadProfileOwnerToTokenId,
  useReadProfileStats,
  useWriteProfileRegister,
} from '@/wagmi'
import { useAddress } from '@/shared/web3'

export type ProfileStats = {
  createdAt: Date
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
  const { profile } = useParams()
  const address = (profile as `0x${string}`) || connectedAddress
  const profileAddress = useAddress('Market#Profile')

  const config = useConfig()

  const { data: tokenId, refetch: refetchTokenId } = useReadProfileOwnerToTokenId({
    address: profileAddress,
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!profileAddress,
    },
  })

  const { data: rawStats, refetch: refetchStats } = useReadProfileStats({
    address: profileAddress,
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId && tokenId > 0n && !!profileAddress,
    },
  })

  const { writeContractAsync: register } = useWriteProfileRegister()

  const stats = useMemo<ProfileStats | null>(() => {
    if (!rawStats) return null
    return {
      createdAt: new Date(Number(rawStats.createdAt) * 1000),
      upvotes: Number(rawStats.upvotes),
      downvotes: Number(rawStats.downvotes),
      volumeUSD: Number(rawStats.volumeUSD),
      dealsCompleted: Number(rawStats.dealsCompleted),
      dealsExpired: Number(rawStats.dealsExpired),
      disputesLost: Number(rawStats.disputesLost),
      avgPaymentTime: Number(rawStats.avgPaymentTime),
      avgReleaseTime: Number(rawStats.avgReleaseTime),
    }
  }, [rawStats])

  async function create() {
    if (!profileAddress) return
    const hash = await register({ address: profileAddress })
    await waitForTransactionReceipt(config, { hash })
    await refetchTokenId()
    await refetchStats()
  }

  function rating(upvotes: number, downvotes: number) {
    const totalVotes = upvotes + downvotes
    if (totalVotes === 0) return '-'
    return `${((upvotes / totalVotes) * 100).toFixed(2)}%`
  }

  return {
    address,
    tokenId: tokenId === 0n ? null : tokenId,
    stats,
    isOwnProfile: !profile,
    create,
    rating,
  }
}
