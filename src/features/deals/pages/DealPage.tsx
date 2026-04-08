import { Col, Row, Skeleton, message } from 'antd'
import DealProgress from '@/features/deals/components/DealProgress'
import DealInfo from '@/features/deals/components/DealInfo'
import MessageBox from '@/features/deals/components/MessageBox'
import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useEffect } from 'react'
import Controls from '@/features/deals/components/Controls'

export default function DealPage() {
  const { deal, error } = useDeal()

  useEffect(() => {
    if (error) {
      console.error(error)
      message.error('Failed to load deal')
    }
  }, [error])

  if (!deal) return <Skeleton active />

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '48px', paddingBottom: '80px' }}>
      <Helmet>
        <title>Deal #{deal.address?.slice(0, 8)}... - PEXFI</title>
        <meta name="description" content={`View details for Deal on PEXFI.`} />
      </Helmet>

      {/* Progress Tracker */}
      <div style={{ marginBottom: '48px' }}>
        <DealProgress />
      </div>

      <Row gutter={32}>
        <Col xs={24} lg={15}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Deal Summary Card */}
            <div className="glass-panel" style={{ 
              padding: '32px', 
              borderRadius: '16px', 
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <DealInfo />
            </div>

            {/* Controls Section */}
            <div style={{ marginTop: '16px' }}>
              <Controls />
            </div>

            {/* Safety Tip */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 184, 105, 0.05)', 
              border: '1px solid rgba(255, 184, 105, 0.1)', 
              borderRadius: '12px',
              display: 'flex',
              gap: '12px'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#ffb869' }}>info</span>
              <p style={{ fontSize: '0.75rem', color: '#cbc3d7', margin: 0, lineHeight: '1.5' }}>
                <strong style={{ color: '#ffb869', textTransform: 'uppercase', marginRight: '4px' }}>Security Alert:</strong>
                Never release assets or confirm payment until you have verified the funds in your account. PEXFI will never ask for your password via chat.
              </p>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={9}>
          <div style={{ height: '700px', position: 'sticky', top: '100px' }}>
            <MessageBox />
          </div>
        </Col>
      </Row>
    </div>
  )
}
