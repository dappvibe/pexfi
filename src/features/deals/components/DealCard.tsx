import { Card, Divider, Skeleton } from 'antd'
import { useEffect, useState } from 'react'
import { useDealContext } from '@/features/deals/hooks/useDealContext'
import Controls from '@/features/deals/components/Controls'
import { useAccount } from 'wagmi'
import { equal } from '@/utils'
import DealProgress from '@/features/deals/components/DealProgress'
import DealInfo from '@/features/deals/components/DealInfo'

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
