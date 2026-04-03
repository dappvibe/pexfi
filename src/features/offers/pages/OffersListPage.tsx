import TokenNav from '@/features/offers/components/TokenNav'
import OffersFilters from '@/features/offers/components/OffersFilters'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function OffersListPage({ filter: superFilter = null }) {
  const { side = 'sell', token = 'WETH', fiat = 'USD' } = useParams()
  const { offers, loading, loadMore, totalOffers, setFilterAmount } = useOffersList({ superFilter })

  const action = side === 'sell' ? 'Buy' : 'Sell'
  const actionLower = side === 'sell' ? 'buy' : 'sell'

  return (
    <div className="flex flex-col gap-10 py-8">
      <Helmet>
        <title>{action} {token} with {fiat} - PEXFI</title>
        <meta name="description" content={`Browse offers to ${actionLower} ${token} using ${fiat} on PEXFI.`} />
      </Helmet>

      {/* Market Header / Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Node: Marketplace</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
            {action} <span className="text-primary">{token}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
           <Button asChild variant="outline" size="sm" className="h-10 rounded-xl px-6 border-white/5 bg-white/[0.02]">
              <Link to="/trade/offer/new">Create Offer</Link>
           </Button>
        </div>
      </div>

      {/* Search & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-low p-2 rounded-2xl ambient-shadow">
        <div className="flex items-center p-2">
          <TokenNav />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 p-2 lg:pr-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/30 hidden sm:block">Parameters</div>
          <OffersFilters setFilterAmount={setFilterAmount} />
        </div>
      </div>

      {/* Main Table Section */}
      <div className="mt-4">
        <OffersTable offers={offers} loading={loading} loadMore={loadMore} totalOffers={totalOffers} />
      </div>
    </div>
  )
}
