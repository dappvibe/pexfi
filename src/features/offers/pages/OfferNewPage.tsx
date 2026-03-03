import { Card, Skeleton } from 'antd'
import OfferForm from '@/features/offers/components/OfferForm'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'

export default function OfferNewPage() {
  const offerForm = useOfferForm()

  if (offerForm.inventoryLoading) return <Skeleton active />

  return (
    <Card title={'Publish an Offer'}>
      <OfferForm {...offerForm} />
    </Card>
  )
}
