import { Avatar, Button, Result, Skeleton, Tabs } from 'antd'
import { Username } from '@/shared/web3'
import { LoadingButton } from '@/shared/ui'
import { useProfilePage } from '@/features/profile/hooks/useProfilePage'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useConnection } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'
import OffersTable from '@/features/offers/components/OffersTable'
import { useOffersList } from '@/features/offers/hooks/useOffersList'

export default function ProfilePage() {
  const { isConnected, isConnecting, isReconnecting, address: connectedAddress } = useConnection()
  const activeAccount = useActiveAccount()
  const { address, tokenId, profile, stats, isOwnProfile, create, rating, loading } = useProfilePage()

  // For the offers list filtered by owner
  const { offers, loading: offersLoading, loadMore, totalOffers } = useOffersList({
    superFilter: { owner: address, disabled: false }
  })

  const reallyConnected = isConnected || !!connectedAddress || !!activeAccount

  if (isOwnProfile && (isConnecting || isReconnecting)) return <Skeleton active />

  if (isOwnProfile && !reallyConnected) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '80px' }}>
        <Helmet>
          <title>My Profile - PEXFI</title>
          <meta name="description" content="View your PEXFI user profile." />
        </Helmet>
        <Result title={'Please connect your wallet to view your profile'} />
      </div>
    )
  }

  if (loading) return <Skeleton active />

  if (tokenId && stats) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '48px', paddingBottom: '80px', width: '100%' }}>
        <Helmet>
          <title>Profile #{tokenId.toString()} - PEXFI</title>
          <meta name="description" content="View PEXFI user profile." />
        </Helmet>

        {/* Profile Header */}
        <section style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          gap: '32px', 
          background: '#1c1b1d', 
          padding: '32px', 
          borderRadius: '16px', 
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '48px'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'rgba(208, 188, 255, 0.05)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '24px', padding: '4px', background: 'linear-gradient(135deg, #d0bcff 0%, #353437 100%)' }}>
               <Avatar src={`https://effigy.im/a/${address}.svg`} size={88} style={{ borderRadius: '20px', background: '#131315' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#e5e1e4', margin: 0, letterSpacing: '-0.025em' }}>
                   <Username address={address || ''} style={{ color: 'inherit' }} />
                </h1>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#ffb869', background: 'rgba(255, 184, 105, 0.1)', padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified Merchant
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#cbc3d7', margin: 0 }}>
                Joined {stats.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} • ID: {tokenId.toString()}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                 <span style={{ background: 'rgba(255, 184, 105, 0.1)', color: '#ffb869', fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Top Merchant</span>
                 <span style={{ background: 'rgba(208, 188, 255, 0.1)', color: '#d0bcff', fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Fast Responder</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e1e4' }}>{rating(stats.upvotes, stats.downvotes)}</div>
               <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rating</div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e5e1e4' }}>{stats.dealsCompleted}</div>
               <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deals</div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffb4ab' }}>{stats.disputesLost}</div>
               <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Disputes</div>
            </div>
          </div>
        </section>

        <Tabs
          defaultActiveKey="offers"
          items={[
            {
              key: 'offers',
              label: <span style={{ fontWeight: 700, padding: '0 8px' }}>Active Offers</span>,
              children: (
                <div style={{ marginTop: '24px' }}>
                  <OffersTable offers={offers as any} loading={offersLoading} loadMore={loadMore} totalOffers={totalOffers} />
                </div>
              ),
            },
            {
              key: 'deals',
              label: <span style={{ fontWeight: 700, padding: '0 8px' }}>History</span>,
              children: <div style={{ padding: '48px', textAlign: 'center', color: '#cbc3d7' }}>Trading history is available in My Deals section.</div>,
            },
          ]}
        />
      </div>
    )
  }

  if (!isOwnProfile) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '80px' }}>
        <Helmet>
          <title>Profile - PEXFI</title>
          <meta name="description" content="View PEXFI user profile." />
        </Helmet>
        <Result title={'This address does not have a profile token.'} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '80px' }}>
      <Helmet>
        <title>Setup Profile - PEXFI</title>
        <meta name="description" content="Create your PEXFI user profile." />
      </Helmet>
      <Result
        title={'You do not have a profile token yet.'}
        extra={
          <LoadingButton 
            type={'primary'} 
            onClick={create}
            style={{
              height: '56px',
              padding: '0 48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              border: 'none',
              color: '#3c0091',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 10px 30px rgba(160, 120, 255, 0.3)'
            }}
          >
            Mint Profile Token
          </LoadingButton>
        }
      />
    </div>
  )
}
