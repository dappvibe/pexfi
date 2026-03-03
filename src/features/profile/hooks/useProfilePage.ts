import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { BigNumberish, ContractTransactionResponse } from 'ethers'
import { useContract } from '@/shared/web3'

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
  let { address } = useAccount()
  const { Profile: ProfileContract, signed } = useContract()
  const [tokenId, setTokenId] = useState<BigNumberish | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)

  const { profile } = useParams()
  if (profile) address = profile as `0x${string}`

  useEffect(() => {
    if (address) {
      ProfileContract.ownerToTokenId(address).then((id) => {
        if (!id) return
        setTokenId(id)
        refreshStats(id)
      })
    }
    return () => {
      setTokenId(null)
      setStats(null)
    }
  }, [address])

  async function create() {
    const rep = await signed(ProfileContract)
    return rep.register().then((tx: ContractTransactionResponse) => {
      tx.wait().then((receipt) => {
        const { args } = ProfileContract.interface.parseLog(receipt.logs[0])
        setTokenId(args[2])
        refreshStats(args[2])
      })
    })
  }

  async function refreshStats(id: BigNumberish) {
    let result: any = await ProfileContract.stats(id)
    result = result.map(Number)
    setStats({
      createdAt: new Date(result[0] * 1000),
      upvotes: result[1],
      downvotes: result[2],
      volumeUSD: result[3],
      dealsCompleted: result[4],
      dealsExpired: result[5],
      disputesLost: result[6],
      avgPaymentTime: result[7],
      avgReleaseTime: result[8],
    })
  }

  function rating(upvotes: number, downvotes: number) {
    const totalVotes = upvotes + downvotes
    if (totalVotes === 0) return '-'
    return `${((upvotes / totalVotes) * 100).toFixed(2)}%`
  }

  return {
    address,
    tokenId,
    stats,
    isOwnProfile: !profile,
    create,
    rating,
  }
}
