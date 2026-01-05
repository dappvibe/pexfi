import { Col, Menu, Row } from 'antd'
import { generatePath, Link, useParams } from 'react-router-dom'
import WalletMenu from 'components/WalletMenu'
import NetworkSelector from 'components/NetworkSelector'
import Notifications from 'components/Notifications'
import logo from 'assets/images/logo.png'

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
        <Row>
          <Col xs={0} sm={12}>
            <NetworkSelector />
          </Col>
          <Col xs={24} sm={12}>
            <WalletMenu />
          </Col>
          <Col xs={0}>
            {' '}
            {/* It only shows popups, no bell icon. */}
            <Notifications />
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
