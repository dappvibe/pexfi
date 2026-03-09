import { Avatar, Button, Col, Menu, Popover, Row } from 'antd'
import { formatAddress } from '@/utils'
import { Link } from 'react-router-dom'
import { ConnectButton, ConnectEmbed, useActiveAccount, darkTheme } from 'thirdweb/react'
import { client } from '@/thirdweb'
import { mainnet, sepolia, hardhat } from 'thirdweb/chains'
import { createWallet } from 'thirdweb/wallets'
import { WalletOutlined } from '@ant-design/icons'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
  createWallet('com.brave.wallet'),
  createWallet('walletConnect'),
]

const customTheme = darkTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  colors: {
    accentText: '#1890ff',
    accentButtonBg: '#1890ff',
    modalBg: '#141414',
  },
})

export default function WalletMenu() {
  const account = useActiveAccount()
  const address = account?.address

  const renderUserMenu = (address: string) => {
    const userMenuItems = [
      { label: <Link to={'/trade/offer/new'}>Create Offer</Link>, key: 'create-offer' },
      { label: <Link to={'/me/offers'}>My Offers</Link>, key: 'my-offers' },
      { label: <Link to={'/me/deals'}>My Deals</Link>, key: 'my-deals' },
      { label: <Link to={'/me'}>Profile</Link>, key: 'profile' },
    ]

    return [
      {
        key: address,
        label: (
          <Row>
            <Col xs={{ span: 8, offset: 16 }} sm={{ offset: 0 }}>
              <Avatar src={`https://effigy.im/a/${address}.svg`} draggable={false} />
            </Col>
            <Col xs={{ span: 0 }} sm={{ span: 16 }}>
              <b>{formatAddress(address)}</b>
            </Col>
          </Row>
        ),
        children: userMenuItems,
      },
    ]
  }

  if (address) {
    const userMenu = renderUserMenu(address)
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu items={userMenu} theme={'dark'} mode={'horizontal'} triggerSubMenuAction={'hover'} selectable={false} style={{ minWidth: 200 }} />
        <ConnectButton
          client={client}
          theme={customTheme}
          wallets={wallets}
          detailsButton={{
            displayBalanceToken: {
              [hardhat.id]: '0x...', // placeholder if needed
            },
          }}
        />
      </div>
    )
  }

  const connectContent = (
    <div style={{ width: '320px' }}>
      <ConnectEmbed
        client={client}
        theme={customTheme}
        wallets={wallets}
        chains={[mainnet, sepolia, hardhat]}
        modalSize="compact"
        className="pexfi-connect-embed"
        header={{
          title: 'Connect to PEXFI',
          showThirdwebBranding: false,
        }}
      />
    </div>
  )

  return (
    <Popover content={connectContent} trigger="click" placement="bottomRight" overlayInnerStyle={{ padding: 0, backgroundColor: '#141414', border: '1px solid #303030' }}>
      <Button type="primary" icon={<WalletOutlined />} style={{ borderRadius: '8px', fontWeight: 600, height: '40px' }}>
        Connect Wallet
      </Button>
    </Popover>
  )
}
