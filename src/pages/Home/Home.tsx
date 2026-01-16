import { Card, Col, Row } from 'antd'
import Faq from '@/pages/Home/Faq'

export default function Home() {
  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Fully Decentralized P2P Crypto Marketplace</h1>
        <p>Trade ERC20 tokens securely and censorship-resistant — entirely on-chain.</p>
        <p>Make crypto decentralized again, as it was meant to be: peer-to-peer.</p>
      </header>
      <Row gutter={16}>
        <Col span={8}>
          <Card title={'Unstoppable'}>
            <p>The marketplace operates without a central server.</p>
            <p>The client app connects directly to the blockchain.</p>
            <p>Download and use it locally for a fully decentralized experience.</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={'Non-custodial'}>
            <p>No accounts needed — your crypto, your wallet.</p>
            <p>Each trade is facilitated by an on-demand funded smart contract.</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={'Anonymous'}>
            <p>The platform does not handle funds and does not enforce KYC/AML requirements.</p>
            <p>Individual traders may request KYC if they choose.</p>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Card title={'No Limits'}>
            <p>Traders set their own rules for their ads — any amount goes.</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={'Tokenized Reputation'}>
            <p>Trading stats are represented as an NFT, making it flexible.</p>
            <p>It can be linked to multiple addresses, transferred, or sold.</p>
            <p>Your reputation is your asset.</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title={'Secure'}>
            <p>Traded crypto is held in a smart contract for security.</p>
            <p>A dispute resolution system is in place.</p>
            <p>Arbitrators can only release or revert payments — they cannot redirect funds elsewhere.</p>
          </Card>
        </Col>
      </Row>
      <Faq />
    </>
  )
}
