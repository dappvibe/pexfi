import { Link } from 'react-router-dom'
import { Empty, List, Skeleton, Tag } from 'antd'
import React from 'react'
import { useAccount } from 'wagmi'
import { gql, useQuery } from '@apollo/client'

const USER_DEALS_QUERY = gql`
  query UserDeals($user: Bytes!) {
    asMaker: deals(where: { offer_: { owner: $user } }, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      state
      tokenAmount
      fiatAmount
      offer {
        id
        token {
          id
          decimals
          symbol
        }
        fiat
        method
        owner
        isSell
      }
      taker
    }
    asTaker: deals(where: { taker: $user }, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      state
      tokenAmount
      fiatAmount
      offer {
        id
        token {
          id
          decimals
          symbol
        }
        fiat
        method
        owner
        isSell
      }
      taker
    }
  }
`

function StateTag({ state }) {
  const index = ['Initiated', 'Accepted', 'Funded', 'Paid', 'Disputed', 'Canceled', 'Resolved', 'Completed']
  return <Tag color={state === 7 ? 'green' : 'blue'}>{index[state]}</Tag>
}

function DealItem({ deal }) {
  const { address } = useAccount()

  function title(deal) {
    const href = '/trade/deal/' + deal.id
    const isSeller = deal.seller.toLowerCase() === address?.toLowerCase()
    let title = isSeller ? 'Sell ' : 'Buy '
    title +=
      deal.tokenAmount +
      ' ' +
      deal.offer.token.symbol +
      ' for ' +
      deal.fiatAmount +
      ' ' +
      deal.offer.fiat +
      ' with ' +
      deal.offer.method
    return <Link to={href}>{title}</Link>
  }

  function time(timestamp) {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <List.Item>
      <List.Item.Meta
        title={title(deal)}
        description={
          <>
            <StateTag state={deal.state} />
            Created: {time(deal.createdAt)}
          </>
        }
      />
    </List.Item>
  )
}

export default function UserDeals() {
  const { address } = useAccount()
  const { data, loading, error } = useQuery(USER_DEALS_QUERY, {
    variables: { user: address },
    skip: !address,
  })

  if (loading || !address) {
    return <Skeleton active />
  }

  if (error) {
    console.error('Error loading deals:', error)
    return <Empty description="Error loading deals" />
  }

  const deals = [...(data?.asMaker || []), ...(data?.asTaker || [])]
    .map((deal) => {
      const decimals = deal.offer.token.decimals
      return {
        ...deal,
        tokenAmount: Number(deal.tokenAmount) / 10 ** decimals,
        fiatAmount: Number(deal.fiatAmount) / 10 ** 6,
        seller: deal.offer.isSell ? deal.offer.owner : deal.taker,
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)

  if (deals.length === 0) return <Empty />

  return (
    <List itemLayout={'vertical'} bordered={true}>
      {deals.map((deal) => (
        <DealItem key={deal.id} deal={deal} />
      ))}
    </List>
  )
}
