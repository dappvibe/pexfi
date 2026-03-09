import TokenNav from '@/features/offers/components/TokenNav'
import OffersFilters from '@/features/offers/components/OffersFilters'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useParams } from 'react-router-dom'

export default function OffersListPage({ filter: superFilter = null }) {
  const { side = 'sell', token = 'WETH', fiat = 'USD' } = useParams()
  const { offers, loading, loadMore, totalOffers, setFilterAmount } = useOffersList({ superFilter })

  const action = side === 'sell' ? 'Buy' : 'Sell'
  const actionLower = side === 'sell' ? 'buy' : 'sell'

  return (
    <>
      <Helmet>
        <title>{action} {token} with {fiat} - PEXFI</title>
        <meta name="description" content={`Browse offers to ${actionLower} ${token} using ${fiat} on PEXFI.`} />
      </Helmet>
      <TokenNav />
      <OffersFilters setFilterAmount={setFilterAmount} />
      <OffersTable offers={offers} loading={loading} loadMore={loadMore} totalOffers={totalOffers} />
    </>
  )
}
