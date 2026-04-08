import { Card, Skeleton } from 'antd'
import OfferForm from '@/features/offers/components/OfferForm'
import { useOfferForm } from '@/features/offers/hooks/useOfferForm'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function OfferNewPage() {
  const offerForm = useOfferForm()

  if (offerForm.inventoryLoading) return <Skeleton active />

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', paddingTop: '48px', paddingBottom: '80px' }}>
      <Helmet>
        <title>Create New Offer - PEXFI</title>
        <meta name="description" content="Create a new P2P crypto trading offer on PEXFI." />
      </Helmet>
      
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#e5e1e4', marginBottom: '8px' }}>
            Create New Offer
          </h1>
          <p style={{ color: '#cbc3d7', fontSize: '1rem' }}>
            Configure your peer-to-peer liquidity parameters.
          </p>
        </div>
        
        <div style={{ padding: '12px', background: '#1c1b1d', borderRadius: '12px', border: '1px solid rgba(73, 68, 84, 0.1)' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ffb869', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>MARKET STATUS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffb869', boxShadow: '0 0 8px #ffb869' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e1e4' }}>WETH/USD Live</span>
          </div>
        </div>
      </div>

      <div style={{
        background: '#1c1b1d', // surface-container-low
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(73, 68, 84, 0.05)'
      }}>
        <OfferForm {...offerForm} />
      </div>
    </div>
  )
}
