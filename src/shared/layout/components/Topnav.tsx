import { Col, Menu, Row } from 'antd'
import { generatePath, Link, useParams } from 'react-router-dom'
import { Notifications, WalletMenu } from '@/shared/web3'
import logo from '@/assets/images/logo.png'

export default function Topnav() {
  const params = useParams()

  const navItems = [
    {
      key: 'sell',
      label: <Link to={generatePath('/trade/sell/:token?/:fiat?/:method?', useParams() as any)}>Sell</Link>,
    },
    {
      key: 'buy',
      label: <Link to={generatePath('/trade/buy/:token?/:fiat?/:method?', useParams() as any)}>Buy</Link>,
    },
    {
      key: 'docs',
      label: <a href={'/docs'}>Learn</a>,
    },
  ]

  return (
    <Row align="middle" wrap={false}>
      <Col xs={{ flex: '80px' }}>
        <Link to={'/'} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img alt={'Logo'} src={logo} style={{ maxWidth: '40px', height: 'auto' }} />
        </Link>
      </Col>
      <Col flex={'auto'}>
        <Menu mode={'horizontal'} theme={'dark'} items={navItems} defaultSelectedKeys={[params.side]} />
      </Col>
      <Col>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <WalletMenu />
          <Notifications />
        </div>
      </Col>
    </Row>
  )
}
