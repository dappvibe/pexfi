import TokenNav from '@/features/offers/components/TokenNav'
import OffersFilters from '@/features/offers/components/OffersFilters'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'

export default function OffersListPage({ filter: superFilter = null }) {
  const { offers, loading, loadMore, totalOffers, setFilterAmount } = useOffersList({ superFilter })

  return (
    <>
      <TokenNav />
      <OffersFilters setFilterAmount={setFilterAmount} />
      <OffersTable offers={offers} loading={loading} loadMore={loadMore} totalOffers={totalOffers} />
    </>
  )
}
