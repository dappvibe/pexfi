import { Card, Skeleton } from 'antd'
import OfferSubnav from '@/features/offers/components/OfferSubnav'
import OfferDescription from '@/features/offers/components/OfferDescription'
import OfferForm from '@/features/offers/components/OfferForm'
import CreateDealForm from '@/features/offers/components/CreateDealForm'
import { useCreateDeal } from '@/features/offers/hooks/useCreateDeal'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'

export default function OfferViewPage() {
  const {
    offer,
    form,
    isOwner,
    lockButton,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  } = useCreateDeal()

  const offerForm = useOfferForm({ offer, setRate, setLimits, setTerms, toggleDisabled })

  if (!offer) return <Skeleton active />

  if (isOwner) {
    return (
      <Card title={'Update offer'}>
        <OfferForm offer={offer} {...offerForm} />
      </Card>
    )
  }

  return (
    <>
      <OfferSubnav offer={offer} />
      <Card
        title={`You are ${offer.isSell ? 'buying' : 'selling'} ${offer.token?.symbol} for ${offer.fiat} using ${offer.method}`}
      >
        <OfferDescription offer={offer} />
        <CreateDealForm
          offer={offer}
          form={form}
          lockButton={lockButton}
          submitLabel={submitLabel}
          submitDisabled={submitDisabled}
          onFinish={(values) => createDeal(offer, values)}
          syncTokenAmount={syncTokenAmount}
          syncFiatAmount={syncFiatAmount}
        />
      </Card>
    </>
  )
}
