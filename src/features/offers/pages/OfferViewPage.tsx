import { Card, Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import OfferSubnav from '@/features/offers/components/OfferSubnav'
import OfferDescription from '@/features/offers/components/OfferDescription'
import EditOfferForm from '@/features/offers/components/EditOfferForm'
import CreateDealForm from '@/features/offers/components/CreateDealForm'
import { useCreateDeal } from '@/features/offers/hooks/useCreateDeal'
import { useOffer } from '@/features/offers/hooks/useOffer'
import { useEditOfferForm } from '@/features/offers/hooks/useEditOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function OfferViewPage() {
  const { offerId } = useParams()
  const { address } = useAccount()
  const {
    offer,
    allowance,
    refetchAllowance,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  } = useOffer(offerId, {
    fetchPrice: true,
    fetchAllowance: true,
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
  } = useCreateDeal({ offer, allowance, refetchAllowance })

  const {
    form: editForm,
    tokens,
    fiats,
    methods,
    inventoryLoading,
    onRateChange,
    previewPrice,
    handleSetRate,
    handleSetLimits,
    handleSetTerms,
    handleToggleDisabled,
  } = useEditOfferForm({ offer, setRate, setLimits, setTerms, toggleDisabled })

  if (!offer || inventoryLoading) return <Skeleton active />

  const isOwner = !!address && !!offer && offer.owner.toLowerCase() === address.toLowerCase()

  if (isOwner) {
    return (
      <>
        <Helmet>
          <title>Update offer - PEXFI</title>
          <meta name="description" content={`Update offer details for ${offer.token?.symbol} on PEXFI.`} />
        </Helmet>
        <Card title={'Update offer'}>
          <EditOfferForm
            offer={offer}
            form={editForm}
            tokens={tokens}
            fiats={fiats}
            methods={methods}
            onRateChange={onRateChange}
            previewPrice={previewPrice}
            handleSetRate={handleSetRate}
            handleSetLimits={handleSetLimits}
            handleSetTerms={handleSetTerms}
            handleToggleDisabled={handleToggleDisabled}
          />
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
