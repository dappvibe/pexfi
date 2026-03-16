import { Col, Row, Skeleton, message } from 'antd'
import DealCard from '@/features/deals/components/DealCard'
import MessageBox from '@/features/deals/components/MessageBox'
import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useEffect } from 'react'

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
    <>
      <Helmet>
        <title>Deal #{deal.address?.toString() || 'Loading'} - PEXFI</title>
        <meta name="description" content={`View details for Deal on PEXFI.`} />
      </Helmet>
      <Row gutter={5}>
        <Col span={16}>
          <DealCard />
        </Col>
        <Col span={8}>
          <MessageBox />
        </Col>
      </Row>
    </>
  )
}
