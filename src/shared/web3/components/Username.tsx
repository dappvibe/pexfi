import { Avatar, Space } from 'antd'
import { Link } from 'react-router-dom'

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

export default function Username({ address, avatar = false, profile = null, style }: UsernameProps) {
  const link = (
    <Link to={'/profile/' + address} style={style}>
      {shortenAddress(address)}
    </Link>
  )

  if (avatar) {
    return (
      <Space>
        <Avatar src={'https://effigy.im/a/' + address + '.svg'} draggable={false} />
        {link}
      </Space>
    )
  } else return link
}
