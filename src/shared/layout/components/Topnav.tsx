import { Col, Menu, Row } from 'antd'
import { generatePath, Link, useParams } from 'react-router-dom'
import { Notifications, WalletMenu } from '@/shared/web3'
import logo from '@/assets/images/logo.png'
import { useAccount } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'

export default function Topnav() {
  const params = useParams()
  const { isConnected, address } = useAccount()
  const activeAccount = useActiveAccount()

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

  const userMenuItems = [
    {
      label: (
        <Link to={'/trade/offer/new'} style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Create Offer
        </Link>
      ),
      key: 'create-offer',
    },
    {
      label: (
        <Link to={'/me/offers'} style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          My Offers
        </Link>
      ),
      key: 'my-offers',
    },
    {
      label: (
        <Link to={'/me/deals'} style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          My Deals
        </Link>
      ),
      key: 'my-deals',
    },
    {
      label: (
        <Link to={'/me'} style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Profile
        </Link>
      ),
      key: 'profile',
    },
  ]

  // Use thirdweb account as fallback if wagmi is not yet synced
  const showUserMenu = isConnected || !!address || !!activeAccount

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
      <Col flex="1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {showUserMenu && (
            <div style={{ display: 'flex', gap: '24px', marginRight: '24px' }}>
              {userMenuItems.map((item) => (
                <span key={item.key}>{item.label}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto' }}>
            <WalletMenu />
            <Notifications />
          </div>
        </div>
      </Col>
    </Row>
  )
}
