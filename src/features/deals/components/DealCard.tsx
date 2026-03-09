import { Card, Divider, Skeleton } from 'antd'
import { useMemo } from 'react'
import { useDealContext } from '@/features/deals/hooks/useDealContext'
import Controls from '@/features/deals/components/Controls'
import { useAccount } from 'wagmi'
import { equal } from '@/utils'
import DealProgress from '@/features/deals/components/DealProgress'
import DealInfo from '@/features/deals/components/DealInfo'

export default function DealCard() {
  const { deal, offer } = useDealContext()
  const { address } = useAccount()

  const title = useMemo(() => {
    if (!deal || !offer || !address) return ''
    const verb = equal(offer.owner, address)
      ? offer.isSell ? 'Selling' : 'Buying'
      : equal(deal.taker, address)
        ? offer.isSell ? 'Buying' : 'Selling'
        : ''
    return `${verb} ${offer.token?.symbol || 'Token'} for ${offer.fiat} using ${offer.method}`
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
