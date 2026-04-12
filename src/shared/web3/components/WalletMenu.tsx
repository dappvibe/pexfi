import { useState } from 'react'
import { Dropdown, Space, Typography, Avatar } from 'antd'
import { useAccount, useDisconnect, useChains, useSwitchChain, useEnsName } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import ConnectWalletModal from './ConnectWalletModal'
import { LogoutOutlined, DownOutlined, GlobalOutlined, UserOutlined, TagOutlined, SwapOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const CHAIN_ICONS: Record<number, string> = {
  [mainnet.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  [sepolia.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  [hardhat.id]: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
}

export default function WalletMenu() {
  const navigate = useNavigate()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const chains = useChains()
  
  const { data: ensName } = useEnsName({ 
    address,
    chainId: mainnet.id,
    query: {
      enabled: !!address
    }
  })
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const displayName = ensName || (address ? shortenAddress(address) : '')

  if (!isConnected) {
    return (
      <>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="primary-gradient text-[#3c0091] px-5 py-2 rounded-xl font-bold transition-transform scale-95 active:scale-90 cursor-pointer border-none h-10"
        >
          Connect
        </button>
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
      key: 'address',
      label: (
        <Space direction="vertical" size={0} style={{ padding: '4px 0' }}>
          <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected as</Text>
          <Text strong>{displayName}</Text>
        </Space>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/me'),
    },
    {
      key: 'offers',
      label: 'My Offers',
      icon: <TagOutlined />,
      onClick: () => navigate('/me/offers'),
    },
    {
      key: 'deals',
      label: 'My Deals',
      icon: <SwapOutlined />,
      onClick: () => navigate('/me/deals'),
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
    <div className="flex items-center gap-2">
      <Dropdown menu={{ items: networkMenuItems }} trigger={['click']} placement="bottomRight">
        <button className="flex items-center justify-center bg-[#2A2A2C]/50 hover:bg-[#353437] p-2 rounded-lg transition-all border-none cursor-pointer h-10 w-10">
          <Avatar src={chain ? CHAIN_ICONS[chain.id] : undefined} size={20} icon={<GlobalOutlined />} />
        </button>
      </Dropdown>

      <Dropdown menu={{ items: walletMenuItems }} trigger={['click']} placement="bottomRight">
        <button className="flex items-center gap-2 bg-[#2A2A2C]/50 hover:bg-[#353437] px-3 py-2 rounded-lg transition-all border-none cursor-pointer h-10 text-[#D0BCFF]">
          <div className="w-2 h-2 rounded-full bg-[#52c41a] shadow-[0_0_8px_rgba(82,196,26,0.5)]" />
          <span className="font-bold text-sm hidden sm:inline">{displayName}</span>
          <DownOutlined className="text-[10px] opacity-50" />
        </button>
      </Dropdown>
    </div>
  )
}
