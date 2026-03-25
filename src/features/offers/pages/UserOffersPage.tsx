import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useConnection } from 'wagmi'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function UserOffersPage() {
  const { address } = useConnection()

  return (
    <>
      <Helmet>
        <title>My Offers - PEXFI</title>
        <meta name="description" content="Manage your P2P crypto trading offers on PEXFI." />
      </Helmet>
      <OffersListPage filter={{ owner: address }} />
    </>
  )
}
