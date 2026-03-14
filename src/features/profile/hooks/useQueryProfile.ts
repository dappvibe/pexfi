import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

export const GQL_PROFILE_BY_OWNER = gql`
  query ProfileByOwner($owner: ID!) {
    profile(id: $owner) {
      id
      tokenId
      createdAt
      info
      rating
      upvotes
      downvotes
      dealsCompleted
      disputesLost
    }
  }
`

export type Profile = {
  id: string
  tokenId: string
  createdAt: number
  info: string | null
  rating: number
  upvotes: number
  downvotes: number
  dealsCompleted: number
  disputesLost: number
}

export function useQueryProfile(owner: string | undefined) {
  const { data, loading, error, refetch } = useQuery(GQL_PROFILE_BY_OWNER, {
    variables: { owner: owner?.toLowerCase() },
    skip: !owner,
  })

  const profile = useMemo<Profile | null>(() => {
    return data?.profile || null
  }, [data])

  return {
    profile,
    loading,
    error,
    refetch,
  }
}
