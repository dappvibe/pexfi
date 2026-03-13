import TokenNav from '@/features/offers/components/TokenNav'
import OffersFilters from '@/features/offers/components/OffersFilters'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useParams } from 'react-router-dom'
import { Flex, theme } from 'antd'

export default function OffersListPage({ filter: superFilter = null }) {
  const { side = 'sell', token = 'WETH', fiat = 'USD' } = useParams()
  const { offers, loading, loadMore, totalOffers, setFilterAmount } = useOffersList({ superFilter })
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const action = side === 'sell' ? 'Buy' : 'Sell'
  const actionLower = side === 'sell' ? 'buy' : 'sell'

  return (
    <>
      <Helmet>
        <title>{action} {token} with {fiat} - PEXFI</title>
        <meta name="description" content={`Browse offers to ${actionLower} ${token} using ${fiat} on PEXFI.`} />
      </Helmet>
      <Flex justify="space-between" align="center" style={{ background: colorBgContainer, borderBottom: '1px solid rgba(5, 5, 5, 0.06)', marginBottom: 16 }}>
        <TokenNav style={{ background: 'transparent', borderBottom: 'none', lineHeight: '46px', flex: 1 }} />
        <div style={{ paddingRight: 16 }}>
          <OffersFilters setFilterAmount={setFilterAmount} />
        </div>
      </Flex>
      <OffersTable offers={offers} loading={loading} loadMore={loadMore} totalOffers={totalOffers} />
    </>
  )
}
