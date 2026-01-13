import { Card, Divider, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import Controls from '@/pages/Trade/Deal/Controls'
import { useAccount } from 'wagmi'
import { equal } from '@/utils'
import DealProgress from '@/pages/Trade/Deal/DealProgress'
import DealInfo from '@/pages/Trade/Deal/DealInfo'

export default function DealCard() {
  const { deal, offer } = useDealContext()
  const { address } = useAccount()

  const [title, setTitle] = useState<string>('')
  useEffect(() => {
    if (!deal || !offer || !address) return
    let newTitle: string = ''
    if (equal(offer.owner, address)) {
      newTitle += offer.isSell ? 'Selling' : 'Buying'
    } else if (equal(deal.taker, address)) {
      newTitle += offer.isSell ? 'Buying' : 'Selling'
    }
    newTitle += ' ' + (offer.token?.symbol || 'Token')
    newTitle += ' for ' + offer.fiat
    newTitle += ' using ' + offer.method
    setTitle(newTitle)
  }, [address, deal, offer])

  if (!offer) return <Skeleton active />

  return (
    <Card title={title}>
      <DealProgress />
      <Divider />
      <DealInfo />
      <Divider />
      <Controls />
    </Card>
  )
}
