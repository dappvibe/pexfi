import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useConnection } from 'wagmi'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function UserOffersPage() {
  const { address } = useConnection()

  return (
    <div className="max-w-[1440px] mx-auto py-12 px-4">
      <Helmet>
        <title>Liquidity profile - PEXFI</title>
        <meta name="description" content="Manage your P2P crypto trading offers on PEXFI." />
      </Helmet>
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white tracking-tight">Liquidity <span className="text-primary">Profile</span></h1>
        <p className="text-on-surface-variant mt-2 font-medium">Manage your active marketplace availability.</p>
      </div>
      <OffersListPage filter={{ owner: address }} />
    </div>
  )
}
