import OffersListPage from '@/features/offers/pages/OffersListPage'
import { useAccount } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Empty, Skeleton } from 'antd'

export default function UserOffersPage() {
  const { address: wagmiAddress, isConnected, isConnecting, isReconnecting } = useAccount()
  const activeAccount = useActiveAccount()
  const address = wagmiAddress || activeAccount?.address
  const reallyConnected = isConnected || !!address

  if (isConnecting || isReconnecting) return <Skeleton active />

  if (!reallyConnected) {
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
