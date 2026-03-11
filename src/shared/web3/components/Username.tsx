import { shortenAddress } from 'thirdweb/utils'
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
}

export default function Username({ address, avatar = false, profile = null }: UsernameProps) {
  const trades = profile?.dealsCompleted ?? '-'
  const rating = profile?.rating ?? '??'

  const link = (
    <Link to={'/profile/' + address}>
      {shortenAddress(address)} ({trades}; {rating}%)
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
