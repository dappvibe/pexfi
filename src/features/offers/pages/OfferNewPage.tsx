import { Card, Skeleton } from 'antd'
import CreateOfferForm from '@/features/offers/components/CreateOfferForm'
import { useCreateOfferForm } from '@/features/offers/hooks/useCreateOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function OfferNewPage() {
  const {
    form,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    lockSubmit,
    onSubmit,
    onRateChange,
    previewPrice,
  } = useCreateOfferForm()

  if (inventoryLoading) return <Skeleton active />

  return (
    <>
      <Helmet>
        <title>Create New Offer - PEXFI</title>
        <meta name="description" content="Create a new P2P crypto trading offer on PEXFI." />
      </Helmet>
      <Card title={'Publish an Offer'}>
        <CreateOfferForm
          form={form}
          tokens={tokens}
          fiats={fiats}
          methods={methods}
          lockSubmit={lockSubmit}
          onSubmit={onSubmit}
          onRateChange={onRateChange}
          previewPrice={previewPrice}
        />
      </Card>
    </>
  )
}
