import { Col, Row, Skeleton } from 'antd'
import { DealContext } from '@/features/deals/hooks/useDealContext'
import DealCard from '@/features/deals/components/DealCard'
import MessageBox from '@/features/deals/components/MessageBox'
import { useDealPage } from '@/features/deals/hooks/useDealPage'
import { useDealMessages } from '@/features/deals/hooks/useDealMessages'
import { useDealFeedback } from '@/features/deals/hooks/useDealFeedback'
import { Helmet } from '@dr.pogodin/react-helmet'

export default function DealViewPage() {
  const { deal, offer, ownerProfile, takerProfile, isLoading, refetch } = useDealPage()
  const { messages } = useDealMessages(deal?.address)
  const { feedback } = useDealFeedback(deal?.address, deal?.taker)

  if (!deal || !offer) return <Skeleton active />

  return (
    <DealContext.Provider value={{ deal, offer, ownerProfile, takerProfile, messages, feedback, isLoading, refetch }}>
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
    </DealContext.Provider>
  )
}

