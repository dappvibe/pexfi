import { Avatar, Col, Menu, Row } from 'antd'
import { formatAddress } from '@/utils'
import { Link } from 'react-router-dom'
import { ConnectButton, darkTheme } from 'thirdweb/react'
import { hardhat } from 'thirdweb/chains'
import { createWallet } from 'thirdweb/wallets'
import { useConnect, useConnection, useDisconnect, useSwitchChain } from 'wagmi'
import { thirdwebClient } from '@/wagmi.config.ts'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.brave.wallet'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
]

export default function WalletMenu() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address } = useConnection()
  const { chains, switchChain } = useSwitchChain()

  const connector = connectors.find((c) => c.id === 'in-app-wallet' || c.type === 'inAppWallet')

  const userMenuItems = [
    { label: <Link to={'/trade/offer/new'}>Create Offer</Link>, key: 'create-offer' },
    { label: <Link to={'/me/offers'}>My Offers</Link>, key: 'my-offers' },
    { label: <Link to={'/me/deals'}>My Deals</Link>, key: 'my-deals' },
    { label: <Link to={'/me'}>Profile</Link>, key: 'profile' },
  ]
  const renderUserMenu = (address: string) => {
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

  let menu;
  if (address) {
    const userMenu = renderUserMenu(address)
    menu = (
        <Menu
          items={userMenu}
          theme={'dark'}
          mode={'horizontal'}
          selectable={false}
          style={{ minWidth: '150px' }}
        />
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {menu}
      <ConnectButton
        client={thirdwebClient}
        appMetadata={{
          name: 'PEXFI P2P',
          url: 'https://pexfi.com',
          description: 'onchain P2P marketplace',
        }}
        chains={chains}
        connectButton={{ className: 'wallet-connect-button', label: 'Connect' }}
        connectModal={{
          size: 'wide',
          showThirdwebBranding: false,
          title: 'Connect to PEXFI',
        }}
        detailsButton={{}}
        detailsModal={{
          assetTabs: ['token'],
          hideBuyFunds: true,
          manageWallet: { allowLinkingProfiles: false },
          showTestnetFaucet: true,
          networkSelector: {
            onSwitch: (chain) => switchChain({ chainId: chain.id }),
          },
        }}
        onConnect={() => connect({ connector })}
        onDisconnect={() => disconnect()}
        theme={darkTheme({})}
        wallets={wallets}
      />
    </div>
  )
}
