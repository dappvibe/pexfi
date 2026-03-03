import { Link } from 'react-router-dom'
import { Empty, List, Skeleton, Tag } from 'antd'
import { useAccount } from 'wagmi'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'

function StateTag({ state }: { state: number }) {
  const labels = ['Initiated', 'Accepted', 'Funded', 'Paid', 'Disputed', 'Canceled', 'Resolved', 'Completed']
  return <Tag color={state === 7 ? 'green' : 'blue'}>{labels[state]}</Tag>
}

function DealItem({ deal }: { deal: any }) {
  const { address } = useAccount()

  function time(block: { timestamp: number }) {
    return new Date(block.timestamp * 1000).toLocaleString()
  }

  const href = '/trade/deal/' + deal.contract.target
  let titleText = deal.seller === address ? 'Sell ' : 'Buy '
  titleText +=
    deal.tokenAmount + ' ' + deal.offer.token + ' for ' + deal.fiatAmount + ' ' + deal.offer.fiat + ' with ' + deal.offer.method

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
      {[...deals].reverse().map((deal, i) => (
        <DealItem key={i} deal={deal} />
      ))}
    </List>
  )
}
