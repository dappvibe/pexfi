import { Avatar, Col, Menu, Row } from 'antd'
import { formatAddress } from '@/utils'
import { Link } from 'react-router-dom'
import { ConnectButton, useActiveAccount } from 'thirdweb/react'
import { client } from '@/thirdweb'
import { defineChain } from 'thirdweb'
import { mainnet, sepolia, hardhat } from 'thirdweb/chains'

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
          theme={'dark'}
          detailsButton={{
            displayBalanceToken: {
              [hardhat.id]: "0x...", // placeholder if needed
            }
          }}
        />
      </div>
    )
  }

  return (
    <ConnectButton
      client={client}
      chains={[mainnet, sepolia, hardhat]}
      theme={'dark'}
      connectButton={{
        label: 'Connect Wallet',
      }}
    />
  )
}
