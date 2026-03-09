import { Card, Skeleton } from 'antd'
import OfferForm from '@/features/offers/components/OfferForm'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function OfferNewPage() {
  const offerForm = useOfferForm()

  if (offerForm.inventoryLoading) return <Skeleton active />

  return (
    <>
      <Helmet>
        <title>Create New Offer - PEXFI</title>
        <meta name="description" content="Create a new P2P crypto trading offer on PEXFI." />
      </Helmet>
      <Card title={'Publish an Offer'}>
        <OfferForm {...offerForm} />
      </Card>
    </>
  )
}
