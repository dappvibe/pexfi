import { Card, Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import OfferSubnav from '@/features/offers/components/OfferSubnav'
import OfferDescription from '@/features/offers/components/OfferDescription'
import OfferForm from '@/features/offers/components/OfferForm'
import CreateDealForm from '@/features/offers/components/CreateDealForm'
import { useCreateDeal } from '@/features/offers/hooks/useCreateDeal'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer.ts'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function OfferViewPage() {
  const { offerId } = useParams()
  const { address } = useAccount()
  const {
    offer,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  } = useQueryOffer(offerId, {
    fetchPrice: true,
    pollInterval: 2000,
  })

  const {
    form,
    lockButton,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
  } = useCreateDeal({ offer })

  const offerForm = useOfferForm({ offer, setRate, setLimits, setTerms, toggleDisabled })

  if (!offer) return <Skeleton active />

  const isOwner = !!address && !!offer && offer.owner.toLowerCase() === address.toLowerCase()

  if (isOwner) {
    return (
      <>
        <Helmet>
          <title>Update offer - PEXFI</title>
          <meta name="description" content={`Update offer details for ${offer.token?.symbol} on PEXFI.`} />
        </Helmet>
        <Card title={'Update offer'}>
          <OfferForm offer={offer} {...offerForm} />
        </Card>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{offer.isSell ? 'Buy' : 'Sell'} {offer.token?.symbol} for {offer.fiat} - PEXFI</title>
        <meta name="description" content={`View offer details for ${offer.token?.symbol} on PEXFI.`} />
      </Helmet>
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
          submitDisabled={submitDisabled || !address}
          onFinish={(values) => createDeal(values)}
          syncTokenAmount={syncTokenAmount}
          syncFiatAmount={syncFiatAmount}
        />
      </Card>
    </>
  )
}
