import { useParams } from 'react-router-dom'
import { Card, Skeleton } from 'antd'
import OfferForm from '@/pages/Trade/Offer/OfferForm'
import { useOffer } from './hooks/useOffer'

export default function OfferEdit() {
  const { offerId } = useParams()
  const { offer } = useOffer(offerId)

  if (!offer) return <Skeleton active />

  return (
    <Card title={'Update offer'}>
      <OfferForm offer={offer} />
    </Card>
  )
}
