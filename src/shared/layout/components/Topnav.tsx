import { Col, Menu, Row } from 'antd'
import { generatePath, Link, useParams } from 'react-router-dom'
import { Notifications, WalletMenu } from '@/shared/web3'
import logo from '@/assets/images/logo.png'
import { useConnection } from 'wagmi'
import { useActiveAccount } from 'thirdweb/react'

export default function Topnav() {
  const params = useParams()
  const { isConnected, address } = useConnection()
  const activeAccount = useActiveAccount()

  const navItems = [
    {
      key: 'buy',
      label: <Link to={generatePath('/trade/buy/:token?/:fiat?/:method?', useParams() as any)}>Buy</Link>,
    },
    {
      key: 'sell',
      label: <Link to={generatePath('/trade/sell/:token?/:fiat?/:method?', useParams() as any)}>Sell</Link>,
    },
    {
      key: 'docs',
      label: <a href={'/docs'}>Learn</a>,
    },
  ]

  const userMenuItems = [
    {
      label: (
        <Link to={'/me/offers'}>
          My Offers
        </Link>
      ),
      key: 'my-offers',
    },
    {
      label: (
        <Link to={'/me/deals'}>
          My Deals
        </Link>
      ),
      key: 'my-deals',
    },
  ]

  const showUserMenu = isConnected || !!address || !!activeAccount

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: '72px',
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to={'/'} style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: '#d0bcff',
          textDecoration: 'none'
        }}>
          PEXFI
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navItems.map((item) => (
            <span key={item.key} style={{
              color: params.side === item.key ? '#d0bcff' : '#cbc3d7',
              fontWeight: 600,
              fontSize: '0.9375rem',
              borderBottom: params.side === item.key ? '2px solid #d0bcff' : 'none',
              paddingBottom: params.side === item.key ? '4px' : '0',
              transition: 'color 0.2s'
            }}>
              {item.label}
            </span>
          ))}
          <div style={{ width: '1px', height: '16px', background: 'rgba(53, 51, 55, 0.4)', margin: '0 8px' }} />
          {userMenuItems.map((item) => (
            <span key={item.key} style={{
              color: '#cbc3d7',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}>
              {item.label}
            </span>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#cbc3d7' }}>
          <Notifications />
          <WalletMenu />
          {!showUserMenu && (
             <button style={{
               background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
               border: 'none',
               padding: '10px 20px',
               borderRadius: '12px',
               fontSize: '0.875rem',
               fontWeight: 700,
               color: '#3c0091',
               cursor: 'pointer'
             }}>
               Connect Wallet
             </button>
          )}
        </div>
      </div>
    </div>
  )
}
