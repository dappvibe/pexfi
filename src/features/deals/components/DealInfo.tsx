import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer'
import { Avatar, Skeleton, Statistic } from 'antd'
import { Username } from '@/shared/web3'
import { useConnection } from 'wagmi'
import { equal, formatMoney } from '@/utils'
import { DealState } from '@/features/deals/hooks/useReadDeal'

export default function DealInfo() {
  const { deal } = useDeal()
  const { offer } = useQueryOffer(deal?.offer)
  const { address } = useConnection()

  if (!deal || !offer) return <Skeleton active />

  const isOwner = equal(address, offer.owner)
  const isTaker = equal(address, deal.taker)
  const isBuyer = (offer.isSell && isTaker) || (!offer.isSell && isOwner)
  const counterparty = isOwner ? deal.taker : offer.owner

  const isActive = deal.state === DealState.Funded || deal.state === DealState.Paid

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Deal Summary
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e5e1e4', margin: 0, letterSpacing: '-0.025em' }}>
            {isBuyer ? 'Buying' : 'Selling'} <span style={{ color: '#d0bcff' }}>{deal.tokenAmountFormatted} {offer.token?.symbol}</span>
            <br />
            for <span style={{ color: '#e5e1e4' }}>{formatMoney(offer.fiat, deal.fiatAmountFormatted)}</span>
          </p>
        </div>
        {isActive && (
          <span style={{ 
            padding: '4px 12px', 
            background: 'rgba(208, 188, 255, 0.1)', 
            color: '#d0bcff', 
            fontSize: '0.625rem', 
            fontWeight: 700, 
            borderRadius: '20px',
            border: '1px solid rgba(208, 188, 255, 0.2)',
            textTransform: 'uppercase'
          }}>
            Escrow Active
          </span>
        )}
      </div>

      {/* Grid: Counterparty & Payment Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div style={{ 
          background: '#201f22', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(73, 68, 84, 0.1)' 
        }}>
          <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {isBuyer ? 'Seller' : 'Buyer'} Information
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={`https://effigy.im/a/${counterparty}.svg`} size={48} style={{ borderRadius: '12px' }} />
            <div>
              <Username address={counterparty} style={{ fontWeight: 700, color: '#e5e1e4', fontSize: '0.875rem' }} />
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbc3d7' }}>Verified Merchant</p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: '#201f22', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(73, 68, 84, 0.1)' 
        }}>
          <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Payment Window
          </h4>
          {deal.state < DealState.Paid ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d0bcff', letterSpacing: '-0.05em' }}>
                <Statistic.Timer value={deal.allowCancelUnpaidAfter} />
              </span>
              <span style={{ fontSize: '0.625rem', color: '#cbc3d7', fontWeight: 600 }}>REMAINING TO PAY</span>
            </div>
          ) : (
             <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d0bcff' }}>
               {deal.state === DealState.Paid ? 'Waiting for release' : 'Payment completed'}
             </div>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Payment Method
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#0e0e10', borderRadius: '8px', width: 'fit-content' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: '#ffb869' }}>payments</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e1e4' }}>{deal.method || offer.method}</span>
          </div>
        </div>

        {deal.paymentInstructions && (
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Payment Instructions
            </h4>
            <div style={{ padding: '16px', background: '#0e0e10', borderRadius: '12px', fontSize: '0.875rem', color: '#e5e1e4', border: '1px solid rgba(208, 188, 255, 0.05)' }}>
              {deal.paymentInstructions}
            </div>
          </div>
        )}

        <div>
          <h4 style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            Trade Terms
          </h4>
          <div style={{ fontSize: '0.875rem', color: '#cbc3d7', lineHeight: '1.6' }}>
            {deal.terms || offer.terms || 'No specific terms provided.'}
          </div>
        </div>
      </div>
    </div>
  )
}
