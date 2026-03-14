import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { message } from 'antd'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { hexToString, trim } from 'viem'
import { useDeal } from '@/wagmi/contracts/useDeal'
import { useOffer } from '@/features/offers/hooks/useOffer'
import { useProfile } from '@/wagmi/contracts/useProfile'
import { useInventory } from '@/shared/web3'

const GQL_DEAL = gql`
  query Deal($id: ID!) {
    deal(id: $id) {
      id
      method
      terms
      paymentInstructions
    }
  }
`

export function useDealPage() {
  const { dealId } = useParams()
  const { methods, loading: inventoryLoading } = useInventory()

  const { deal: contractDeal, isLoading: dealLoading, error, refetch } = useDeal(dealId as `0x${string}`)
  const { offer, isLoading: offerLoading } = useOffer(contractDeal?.offer, { pollInterval: 1000 })
  const { profile: ownerProfile } = useProfile(offer?.owner)
  const { profile: takerProfile } = useProfile(contractDeal?.taker)

  const { data: subgraphData, loading: subgraphLoading } = useQuery(GQL_DEAL, {
    variables: { id: dealId?.toLowerCase() },
    skip: !dealId,
  })

  useEffect(() => {
    if (error) {
      console.error(error)
      message.error('Failed to load deal')
    }
  }, [error])

  const deal = useMemo(() => {
    if (!contractDeal) return null

    let methodName = ''
    let terms = ''
    let paymentInstructions = ''

    if (subgraphData?.deal) {
      const d = subgraphData.deal
      try {
        methodName = hexToString(trim(d.method as `0x${string}`, { dir: 'right' }))
      } catch (e) {
        const found = Object.values(methods).find((m) => Number(m.index) === Number(d.method))
        methodName = found ? found.name : `Method #${d.method}`
      }
      terms = d.terms || ''
      paymentInstructions = d.paymentInstructions || ''
    }

    return {
      ...contractDeal,
      method: methodName,
      terms: terms || contractDeal.terms,
      paymentInstructions: paymentInstructions || contractDeal.paymentInstructions,
    }
  }, [contractDeal, subgraphData, methods])

  return {
    deal,
    offer,
    ownerProfile,
    takerProfile,
    isLoading: dealLoading || offerLoading || subgraphLoading || inventoryLoading,
    refetch,
  }
}
