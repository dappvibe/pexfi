import { Link } from 'react-router-dom'
import { Empty, List, Skeleton, Tag } from 'antd'
import { useAccount } from 'wagmi'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'
import { equal } from '@/utils'

function StateTag({ state }: { state: number }) {
  const labels = ['Initiated', 'Accepted', 'Funded', 'Paid', 'Disputed', 'Canceled', 'Resolved', 'Completed']
  return <Tag color={state === 7 ? 'green' : 'blue'}>{labels[state]}</Tag>
}

function DealItem({ deal }: { deal: any }) {
  const { address } = useAccount()

  function time(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const href = '/trade/deal/' + deal.id
  
  let isBuyer = false
  if (equal(deal.offer.owner, address)) {
    isBuyer = !deal.offer.isSell
  } else if (equal(deal.taker, address)) {
    isBuyer = deal.offer.isSell
  }

  const titleText = `${isBuyer ? 'Buy' : 'Sell'} ${deal.tokenAmountFormatted} ${deal.offer.token.symbol} for ${deal.fiatAmountFormatted} ${deal.offer.fiat} with ${deal.offer.method}`

  return (
    <List.Item>
      <List.Item.Meta
        title={<Link to={href}>{titleText}</Link>}
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

export default function UserDealsPage() {
  const { deals } = useUserDeals()

  if (deals === undefined) return <Skeleton active />
  if (deals.length === 0) return <Empty />

  return (
    <List itemLayout={'vertical'} bordered={true}>
      {deals.map((deal: any, i: number) => (
        <DealItem key={i} deal={deal} />
      ))}
    </List>
  )
}
