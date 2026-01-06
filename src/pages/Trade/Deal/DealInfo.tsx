import React, { useContext } from 'react'
import { DealContext } from '@/pages/Trade/Deal/Deal'
import { Descriptions } from 'antd'
import Username from '@/components/Username'

export default function DealInfo() {
  const { deal } = useContext(DealContext)
  let key = 1
  const items = [
    {
      key: key++,
      label: 'Price',
      children: <b>{(deal.fiatAmount / deal.tokenAmount).toFixed(3)}</b>,
    },
    { key: key++, label: 'Crypto', children: deal.tokenAmount },
    { key: key++, label: 'Fiat', children: deal.fiatAmount.toFixed(2) },
    {
      key: key++,
      label: 'Buyer',
      children: deal.offer.isSell ? <Username address={deal.taker} /> : <Username address={deal.offer.owner} />,
    },
    {
      key: key++,
      label: 'Seller',
      children: !deal.offer.isSell ? <Username address={deal.taker} /> : <Username address={deal.offer.owner} />,
    },
    { key: key++, label: 'Method', children: deal.offer.method },
    {
      key: key++,
      label: 'Payment instructions',
      children: deal.paymentInstructions || <i>None</i>,
    },
    { key: key++, label: 'Terms', children: deal.offer.terms || <i>No terms</i> },
  ]

  return <Descriptions items={items} />
}
