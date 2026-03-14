import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

export const GQL_PROFILE_BY_OWNER = gql`
  query ProfileByOwner($owner: Bytes!) {
    profiles(where: { owner: $owner }, first: 1) {
      id
      owner
      createdAt
      info
      rating
      upvotes
      downvotes
      volumeUSD
      dealsCompleted
      dealsExpired
      disputesLost
      avgPaymentTime
      avgReleaseTime
    }
  }
`

export type Profile = {
  id: string
  owner: string
  createdAt: number
  info: string | null
  rating: number
  upvotes: number
  downvotes: number
  volumeUSD: number
  dealsCompleted: number
  dealsExpired: number
  disputesLost: number
  avgPaymentTime: number
  avgReleaseTime: number
}

export function useQueryProfile(owner: string | undefined) {
  const { data, loading, error, refetch } = useQuery(GQL_PROFILE_BY_OWNER, {
    variables: { owner: owner?.toLowerCase() },
    skip: !owner,
  })

  const profile = useMemo<Profile | null>(() => {
    if (!data?.profiles?.length) return null
    return data.profiles[0]
  }, [data])

  return {
    profile,
    loading,
    error,
    refetch,
  }
}
