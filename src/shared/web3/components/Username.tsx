import { Avatar, Space } from 'antd'
import { Link } from 'react-router-dom'
import { useEnsName, useEnsAvatar } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { Address } from 'viem'

interface Profile {
  dealsCompleted: number
  rating: number
}

interface UsernameProps {
  address: string
  avatar?: boolean
  profile?: Profile | null
  style?: React.CSSProperties
}

const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

export default function Username({ address, avatar = false, style }: UsernameProps) {
  const { data: ensName } = useEnsName({ 
    address: address as Address,
    chainId: mainnet.id 
  })
  const { data: ensAvatar } = useEnsAvatar({ 
    name: ensName || undefined,
    chainId: mainnet.id
  })

  const displayName = ensName || (address ? shortenAddress(address) : '')

  const link = (
    <Link to={'/profile/' + address} style={style}>
      {displayName}
    </Link>
  )

  if (avatar) {
    return (
      <Space>
        <Avatar 
          src={ensAvatar || `https://effigy.im/a/${address}.svg`} 
          draggable={false} 
        />
        {link}
      </Space>
    )
  } else return link
}
