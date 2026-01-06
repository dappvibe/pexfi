import { Card, Divider } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { DealContext } from '@/pages/Trade/Deal/Deal'
import Controls from '@/pages/Trade/Deal/Controls'
import { useAccount } from 'wagmi'
import { equal } from '@/utils'
import DealProgress from '@/pages/Trade/Deal/DealProgress'
import DealInfo from '@/pages/Trade/Deal/DealInfo'

export default function DealCard() {
  const { deal } = useContext(DealContext)
  const { address } = useAccount()

  const [title, setTitle] = useState<string>('')
  useEffect(() => {
    if (!deal || !address) return
    let newTitle: string = ''
    if (equal(deal.offer.owner, address)) {
      newTitle += deal.offer.isSell ? 'Selling' : 'Buying'
    } else if (equal(deal.taker, address)) {
      newTitle += deal.offer.isSell ? 'Buying' : 'Selling'
    }
    newTitle += ' ' + deal.offer.token.id
    newTitle += ' for ' + deal.offer.fiat
    newTitle += ' using ' + deal.offer.method
    setTitle(newTitle)
  }, [address, deal])

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
