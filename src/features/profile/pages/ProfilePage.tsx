import { Card, Descriptions, Result } from 'antd'
import Username from '@/components/Username'
import LoadingButton from '@/components/LoadingButton'
import { useProfilePage } from '@/features/profile/hooks/useProfilePage'

export default function ProfilePage() {
  const { address, tokenId, stats, isOwnProfile, create, rating } = useProfilePage()

  if (tokenId && stats) {
    return (
      <Card title={'Profile token ID: ' + tokenId}>
        <Descriptions layout={'vertical'} title={<Username address={address} avatar />}>
          <Descriptions.Item label={'Registered'}>{stats.createdAt.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={'Rating'}>{rating(stats.upvotes, stats.downvotes)}</Descriptions.Item>
          <Descriptions.Item label={'Deals completed'}>{stats.dealsCompleted}</Descriptions.Item>
          <Descriptions.Item label={'Volume'}>{stats.volumeUSD} USD</Descriptions.Item>
          <Descriptions.Item label={'Deals expired'}>{stats.dealsExpired}</Descriptions.Item>
          <Descriptions.Item label={'Disputes lost'}>{stats.disputesLost}</Descriptions.Item>
          <Descriptions.Item label={'Average payment time'}>{stats.avgPaymentTime} seconds</Descriptions.Item>
          <Descriptions.Item label={'Average release time'}>{stats.avgReleaseTime} seconds</Descriptions.Item>
        </Descriptions>
      </Card>
    )
  }

  if (!isOwnProfile) {
    return <Result title={'This address does not have a profile token.'} />
  }

  return (
    <Result
      title={'You do not have a profile token yet.'}
      extra={
        <LoadingButton type={'primary'} onClick={create}>
          Mint
        </LoadingButton>
      }
    />
  )
}
