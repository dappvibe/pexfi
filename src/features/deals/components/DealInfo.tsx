import { useDealContext } from '@/features/deals/hooks/useDealContext'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer'
import { Descriptions, Skeleton } from 'antd'
import { Username } from '@/shared/web3'

export default function DealInfo() {
  const { deal } = useDealContext()
  const { offer } = useQueryOffer(deal.offer)

  if (!offer) return <Skeleton active />

  const items = [
    {
      key: 1,
      label: 'Price',
      children: <b>{(deal.fiatAmountFormatted / deal.tokenAmountFormatted).toFixed(3)}</b>,
    },
    { key: 2, label: 'Crypto', children: deal.tokenAmountFormatted },
    { key: 3, label: 'Fiat', children: deal.fiatAmountFormatted },
    {
      key: 4,
      label: 'Buyer',
      children: offer.isSell ? <Username address={deal.taker} /> : <Username address={offer.owner} />,
    },
    {
      key: 5,
      label: 'Seller',
      children: !offer.isSell ? <Username address={deal.taker} /> : <Username address={offer.owner} />,
    },
    { key: 6, label: 'Method', children: offer.method },
    {
      key: 7,
      label: 'Payment instructions',
      children: deal.paymentInstructions || <i>None</i>,
    },
    { key: 8, label: 'Terms', children: deal.terms || offer.terms || <i>No terms</i> },
  ]

  return <Descriptions items={items} />
}
