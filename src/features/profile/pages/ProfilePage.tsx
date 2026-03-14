import { Card, Descriptions, Result, Skeleton, Typography } from 'antd'
import { Username } from '@/shared/web3'
import { LoadingButton } from '@/shared/ui'
import { useProfilePage } from '@/features/profile/hooks/useProfilePage'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useAccount } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'

export default function ProfilePage() {
  const { isConnected, isConnecting, isReconnecting, address: connectedAddress } = useAccount()
  const activeAccount = useActiveAccount()
  const { address, tokenId, profile, stats, isOwnProfile, create, updateInfo, rating, loading } = useProfilePage()

  const reallyConnected = isConnected || !!connectedAddress || !!activeAccount

  if (isOwnProfile && (isConnecting || isReconnecting)) return <Skeleton active />

  if (isOwnProfile && !reallyConnected) {
    return (
      <>
        <Helmet>
          <title>My Profile - PEXFI</title>
          <meta name="description" content="View your PEXFI user profile." />
        </Helmet>
        <Result title={'Please connect your wallet to view your profile'} />
      </>
    )
  }

  if (loading) return <Skeleton active />

  if (tokenId && stats) {
    return (
      <>
        <Helmet>
          <title>Profile #{tokenId.toString()} - PEXFI</title>
          <meta name="description" content="View PEXFI user profile." />
        </Helmet>
        <Card title={'Profile token ID: ' + tokenId}>
          <Descriptions layout={'vertical'} title={<Username address={address} avatar profile={profile} />}>
            <Descriptions.Item label={'Info'}>
              <Typography.Paragraph
                editable={isOwnProfile ? { onChange: updateInfo } : false}
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
              >
                {stats.info || (isOwnProfile ? 'Click to add info' : 'No info provided')}
              </Typography.Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label={'Registered'}>{stats.createdAt.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={'Rating'}>{rating(stats.upvotes, stats.downvotes)}</Descriptions.Item>
            <Descriptions.Item label={'Deals completed'}>{stats.dealsCompleted}</Descriptions.Item>
            <Descriptions.Item label={'Disputes lost'}>{stats.disputesLost}</Descriptions.Item>
          </Descriptions>
        </Card>
      </>
    )
  }

  if (!isOwnProfile) {
    return (
      <>
        <Helmet>
          <title>Profile - PEXFI</title>
          <meta name="description" content="View PEXFI user profile." />
        </Helmet>
        <Result title={'This address does not have a profile token.'} />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Setup Profile - PEXFI</title>
        <meta name="description" content="Create your PEXFI user profile." />
      </Helmet>
      <Result
        title={'You do not have a profile token yet.'}
        extra={
          <LoadingButton type={'primary'} onClick={create}>
            Mint
          </LoadingButton>
        }
      />
    </>
  )
}
