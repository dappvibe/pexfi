import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useAccount } from 'wagmi'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Empty } from 'antd'

export default function UserOffersPage() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <>
        <Helmet>
          <title>My Offers - PEXFI</title>
          <meta name="description" content="Manage your P2P crypto trading offers on PEXFI." />
        </Helmet>
        <Empty description="Please connect your wallet to view your offers" />
      </>
    )
  }

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
