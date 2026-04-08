import { Avatar, Button, Flex, Space, Table, Tag } from 'antd'
import type { ColumnType } from 'antd/es/table'
import { Link, useParams } from 'react-router-dom'
import { Username } from '@/shared/web3'
import { formatMoney } from '@/utils'
import { useConnection } from 'wagmi'
import { type Offer } from '@/features/offers/hooks/useQueryOffers'

type MappedOffer = Offer & {
  method: string
  price: string
  fiat: string
  rate: number
}

interface OffersTableProps {
  offers: MappedOffer[]
  loading: boolean
  loadMore: () => void
  totalOffers: number | null
}

export default function OffersTable({ offers, loading, loadMore, totalOffers }: OffersTableProps) {
  const { address } = useConnection()
  let { side = 'sell', token = 'WETH', fiat = 'USD' } = useParams()

  const columns: ColumnType<MappedOffer>[] = [
    {
      title: 'User',
      dataIndex: 'owner',
      render: (text, offer) => {
        const trades = offer.profile?.dealsCompleted ?? 0
        const rating = offer.profile?.rating ?? 0
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              src={'https://effigy.im/a/' + offer.owner + '.svg'} 
              size={40} 
              style={{ borderRadius: '12px', background: '#1c1b1d' }} 
              draggable={false} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Username address={offer.owner} profile={offer.profile} style={{ fontWeight: 700, color: '#e5e1e4' }} />
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbc3d7' }}>{rating}% | {trades} deals</p>
            </div>
          </div>
        )
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (text, offer) => (
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e5e1e4', letterSpacing: '-0.025em' }}>
            {formatMoney(fiat, text)}
          </div>
          <p style={{ margin: 0, fontSize: '0.625rem', color: '#cbc3d7', fontWeight: 700 }}>
            {offer.rate > 10000 ? `${((offer.rate - 10000) / 100).toFixed(1)}% Above Market` : offer.rate < 10000 ? `${((10000 - offer.rate) / 100).toFixed(1)}% Below Market` : 'At Market Price'}
          </p>
        </div>
      ),
    },
    {
      title: 'Limits',
      render: (text, offer) => (
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e5e1e4' }}>
          <div>Min: {formatMoney(fiat, offer.minFiat)}</div>
          <div>Max: {formatMoney(fiat, offer.maxFiat)}</div>
        </div>
      ),
    },
    {
      title: 'Terms',
      responsive: ['md'],
      render: (text, offer) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '240px' }}>
          <Tag style={{ width: 'fit-content', background: '#353437', border: 'none', color: '#e5e1e4', borderRadius: '20px', padding: '2px 12px', fontSize: '0.625rem', fontWeight: 700, margin: 0 }}>{offer.method}</Tag>
          <div style={{ fontSize: '0.75rem', color: '#cbc3d7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={offer.terms}>
            {offer.terms}
          </div>
        </div>
      ),
    },
    {
      title: '',
      align: 'right',
      render: (_, offer) => {
        const isOwner = address && offer.owner.toLowerCase() === address.toLowerCase()
        const btnText = isOwner ? 'Edit' : (side === 'sell' ? 'Sell' : 'Buy')
        return (
          <Link to={`/trade/offer/${offer.id}`}>
            <Button 
              className={!isOwner ? 'primary-gradient' : undefined}
              style={{ 
                height: '44px', 
                borderRadius: '12px', 
                fontWeight: 700, 
                padding: '0 32px',
                border: 'none',
                color: !isOwner ? '#3c0091' : '#e5e1e4',
                background: isOwner ? '#353437' : undefined
              }}
            >
              {btnText} {token}
            </Button>
          </Link>
        )
      },
    },
  ]

  return (
    <div className="offers-table-container">
      <Table
        columns={columns}
        dataSource={offers}
        pagination={false}
        loading={loading}
        rowKey={(offer) => offer.id}
        rowClassName="offer-row"
        showSorterTooltip={false}
      />
      
      {offers.length > 0 && (totalOffers !== null && offers.length >= totalOffers) && (
        <div style={{ textAlign: 'center', color: '#cbc3d7', fontSize: '0.875rem', marginTop: '32px', marginBottom: '64px' }}>
          You've reached the end of the market.
        </div>
      )}
      
      {(totalOffers === null || offers.length < totalOffers) && (
        <Flex justify={'center'} style={{ marginTop: '32px', marginBottom: '64px' }}>
          <Button 
            onClick={loadMore} 
            loading={loading}
            style={{ 
              height: '56px', 
              padding: '0 48px', 
              borderRadius: '16px', 
              background: '#1c1b1d', 
              border: '1px solid rgba(208, 188, 255, 0.2)', 
              color: '#d0bcff', 
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            Show More Offers
          </Button>
        </Flex>
      )}
    </div>
  )
}
