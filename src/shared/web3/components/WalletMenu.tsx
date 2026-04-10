import { useState } from 'react'
import { Button, Dropdown, Space, Typography, Avatar } from 'antd'
import { useAccount, useDisconnect, useBalance, useChains, useSwitchChain, useEnsName } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import ConnectWalletModal from './ConnectWalletModal'
import { DownOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons'

const { Text } = Typography

const CHAIN_ICONS: Record<number, string> = {
  [mainnet.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  [sepolia.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  [hardhat.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
}

export default function WalletMenu() {
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const { switchChain } = useSwitchChain()
  const chains = useChains()
  
  const { data: ensName } = useEnsName({ 
    address,
    chainId: mainnet.id // ENS is only on Ethereum Mainnet
  })
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const displayName = ensName || (address ? shortenAddress(address) : '')

  if (!isConnected) {
    return (
      <>
        <Button 
          type="primary" 
          onClick={() => setIsModalOpen(true)}
          className="wallet-connect-button"
          style={{
            background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
            border: 'none',
            height: '40px',
            padding: '0 24px',
            borderRadius: '12px',
            fontWeight: 700,
            color: '#3c0091'
          }}
        >
          Connect
        </Button>
        <ConnectWalletModal 
          open={isModalOpen} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </>
    )
  }

  const networkMenuItems = chains.map(c => ({
    key: c.id,
    label: (
      <Space>
        <Avatar src={CHAIN_ICONS[c.id]} size={16} icon={<GlobalOutlined />} />
        {c.name}
      </Space>
    ),
    onClick: () => switchChain({ chainId: c.id }),
    disabled: c.id === chain?.id
  }))

  const walletMenuItems: any[] = [
    {
      key: 'balance',
      label: (
        <Space direction="vertical" size={0} style={{ padding: '4px 0' }}>
          <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</Text>
          <Text strong>{balance?.formatted?.slice(0, 8) || '0.00'} {balance?.symbol}</Text>
        </Space>
      ),
    },
    { type: 'divider' },
    {
      key: 'disconnect',
      label: 'Disconnect',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => disconnect(),
    },
  ]

  return (
    <Space size={8}>
      <Dropdown menu={{ items: networkMenuItems }} trigger={['click']} placement="bottomRight">
        <Button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: 0
        }}>
          <Avatar src={chain ? CHAIN_ICONS[chain.id] : undefined} size={20} icon={<GlobalOutlined />} />
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: walletMenuItems }} trigger={['click']} placement="bottomRight">
        <Button style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '40px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}>
          <Space>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#52c41a',
              boxShadow: '0 0 8px rgba(82, 196, 26, 0.5)'
            }} />
            <Text strong style={{ color: '#fff' }}>{displayName}</Text>
            <DownOutlined style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }} />
          </Space>
        </Button>
      </Dropdown>
    </Space>
  )
}
