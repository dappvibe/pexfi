import PropTypes from 'prop-types'
import { formatAddress } from 'utils'
import { Avatar, Space } from 'antd'
import { Link } from 'react-router-dom'

export default function Username({ address, avatar = false, profile = null }) {
  let trades, rating
  if (profile) {
    trades = profile.dealsCompleted
    rating = profile.rating
  } else {
    trades = '-'
    rating = '??'
  }

  const link = (
    <Link to={'/profile/' + address}>
      {formatAddress(address)} ({trades}; {rating}%)
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

Username.propTypes = {
  address: PropTypes.string.isRequired,
  avatar: PropTypes.bool,
}
