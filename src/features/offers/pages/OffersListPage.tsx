import TokenNav from '@/features/offers/components/TokenNav'
import OffersFilters from '@/features/offers/components/OffersFilters'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useParams } from 'react-router-dom'

export default function OffersListPage({ filter: superFilter = null }) {
  const { side = 'sell' } = useParams()
  const { offers, loading, loadMore, totalOffers, setFilterAmount } = useOffersList({ superFilter })

  const action = side === 'sell' ? 'Sell' : 'Buy'

  return (
    <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Helmet>
        <title>{action} Digital Assets - PEXFI</title>
        <meta name="description" content={`Browse offers to ${action.toLowerCase()} digital assets on PEXFI.`} />
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d0bcff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Marketplace</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#e5e1e4', letterSpacing: '-0.05em', margin: 0 }}>
            {action} Digital Assets
          </h1>
        </div>
        <TokenNav />
      </div>

      <section style={{ 
        background: '#1c1b1d', 
        padding: '24px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(73, 68, 84, 0.1)'
      }}>
        <OffersFilters setFilterAmount={setFilterAmount} />
      </section>

      <OffersTable offers={offers} loading={loading} loadMore={loadMore} totalOffers={totalOffers} />
    </div>
  )
}
