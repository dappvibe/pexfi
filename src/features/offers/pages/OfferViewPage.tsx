import { Card, Skeleton } from 'antd'
import { useParams } from 'react-router-dom'
import { useConnection } from 'wagmi'
import OfferSubnav from '@/features/offers/components/OfferSubnav'
import OfferDescription from '@/features/offers/components/OfferDescription'
import OfferForm from '@/features/offers/components/OfferForm'
import CreateDealForm from '@/features/offers/components/CreateDealForm'
import { useCreateDeal } from '@/features/offers/hooks/useCreateDeal'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer.ts'
import { useOfferActions } from '@/features/offers/hooks/useOfferActions.ts'
import { useOfferPrice } from '@/features/offers/hooks/useOfferPrice'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Username } from '@/shared/web3'
import { formatMoney } from '@/utils'

export default function OfferViewPage() {
  const { offerId } = useParams()
  const { address } = useConnection()

  const { offer: baseOffer, refetch } = useQueryOffer(offerId)

  const { price } = useOfferPrice(baseOffer, true)
  const offer = baseOffer ? { ...baseOffer, price } : null

  const {
    setRate,
    setLimits,
    setTerms,
    toggleDisabled,
  } = useOfferActions(offerId, refetch)

  const {
    form,
    lockButton,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
  } = useCreateDeal({ offer })

  const offerForm = useOfferForm({
    offer,
    setRate,
    setLimits,
    setTerms,
    toggleDisabled: () => offer ? toggleDisabled(offer.disabled) : Promise.resolve()
  })

  if (!offer) return <Skeleton active />

  const isOwner = !!address && !!offer && offer.owner.toLowerCase() === address.toLowerCase()

  if (isOwner) {
    return (
      <div style={{ maxWidth: '896px', margin: '0 auto', paddingTop: '48px', paddingBottom: '80px' }}>
        <Helmet>
          <title>Update offer - PEXFI</title>
          <meta name="description" content={`Update offer details for ${offer.token?.symbol} on PEXFI.`} />
        </Helmet>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#e5e1e4', marginBottom: '32px' }}>Update Offer</h1>
        <div style={{ background: '#1c1b1d', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <OfferForm offer={offer} {...offerForm} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', paddingTop: '48px', paddingBottom: '80px' }}>
      <Helmet>
        <title>{offer.isSell ? 'Buy' : 'Sell'} {offer.token?.symbol} for {offer.fiat} - PEXFI</title>
        <meta name="description" content={`View offer details for ${offer.token?.symbol} on PEXFI.`} />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '0.875rem', fontWeight: 600, color: '#cbc3d7' }}>
        <span>Marketplace</span>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
        <span style={{ color: '#e5e1e4' }}>Offer #{offer.id.slice(0, 8)}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Offer Summary Section */}
        <section className="glass-panel" style={{ 
          background: '#1c1b1d', 
          borderRadius: '16px', 
          padding: '32px', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '16px', opacity: 0.1 }}>
             <span className="material-symbols-outlined" style={{ fontSize: '8rem' }}>verified_user</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#353437', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(149, 142, 160, 0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: '#d0bcff' }}>person</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e5e1e4', margin: 0 }}>
                    <Username address={offer.owner} profile={offer.profile} style={{ color: 'inherit' }} />
                  </h2>
                  <span style={{ background: '#ffb869', color: '#482900', padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>Verified Peer</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#cbc3d7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#ffb869', fontVariationSettings: "'FILL' 1" }}>star</span>
                  {offer.profile?.rating}% rating • {offer.profile?.dealsCompleted} Trades
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Price</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d0bcff', margin: 0 }}>{formatMoney(offer.fiat, offer.price)} {offer.fiat}/{offer.token?.symbol}</p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '16px', 
            marginTop: '32px', 
            paddingTop: '24px', 
            borderTop: '1px solid rgba(73, 68, 84, 0.1)' 
          }}>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Limits</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e1e4', margin: 0 }}>{offer.minFiat} - {offer.maxFiat} {offer.fiat}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Method</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d0bcff' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e1e4', margin: 0 }}>{offer.method}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Time Limit</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e1e4', margin: 0 }}>15 Minutes</p>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Escrow</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffb869', margin: 0 }}>Smart Contract Verified</p>
            </div>
          </div>
        </section>

        {/* Create Deal Form Section */}
        <section style={{ 
          background: '#201f22', 
          borderRadius: '16px', 
          padding: '40px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '1px solid rgba(73, 68, 84, 0.05)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e5e1e4', margin: 0 }}>Initialize Trade</h1>
            <p style={{ fontSize: '0.875rem', color: '#cbc3d7', marginTop: '8px' }}>
              Enter the amount you wish to exchange. Funds are held securely in a non-custodial smart contract.
            </p>
          </div>

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
        </section>

        {/* Footer info blocks */}
        <div style={{ display: 'grid', md: { gridTemplateColumns: 'repeat(3, 1fr)' }, gap: '24px', opacity: 0.7 }}>
          <div style={{ padding: '16px', borderLeft: '2px solid rgba(160, 120, 255, 0.2)' }}>
            <span className="material-symbols-outlined" style={{ color: '#d0bcff', marginBottom: '8px' }}>security</span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e1e4', marginBottom: '4px' }}>P2P Encryption</h4>
            <p style={{ fontSize: '0.75rem', color: '#cbc3d7', margin: 0 }}>All chat communications are end-to-end encrypted and readable only by the trade parties.</p>
          </div>
          <div style={{ padding: '16px', borderLeft: '2px solid rgba(160, 120, 255, 0.2)' }}>
            <span className="material-symbols-outlined" style={{ color: '#d0bcff', marginBottom: '8px' }}>timer</span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e1e4', marginBottom: '4px' }}>Fast Settlement</h4>
            <p style={{ fontSize: '0.75rem', color: '#cbc3d7', margin: 0 }}>Average deal completion time is under 10 minutes once payment is verified.</p>
          </div>
          <div style={{ padding: '16px', borderLeft: '2px solid rgba(160, 120, 255, 0.2)' }}>
            <span className="material-symbols-outlined" style={{ color: '#d0bcff', marginBottom: '8px' }}>account_balance_wallet</span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e1e4', marginBottom: '4px' }}>Non-Custodial</h4>
            <p style={{ fontSize: '0.75rem', color: '#cbc3d7', margin: 0 }}>PEXFI never holds your funds. Escrow is managed entirely by audited smart contracts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
