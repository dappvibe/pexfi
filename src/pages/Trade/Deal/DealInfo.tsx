import React from 'react'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import { Descriptions, Skeleton } from 'antd'
import Username from '@/components/Username'

export default function DealInfo() {
  const { deal, offer } = useDealContext()

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
