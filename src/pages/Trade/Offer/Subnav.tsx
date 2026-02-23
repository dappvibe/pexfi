import { Link } from 'react-router-dom'
import { Breadcrumb, Space } from 'antd'
import { DoubleLeftOutlined } from '@ant-design/icons'
import React from 'react'

export default function Subnav({ offer }) {
  return (
    <Breadcrumb
      style={{ margin: '10px 20px' }}
      items={[
        {
          title: (
            <Link to={`/trade/sell/${offer.token}/${offer.fiat}/${offer.method}`}>
              <Space>
                <DoubleLeftOutlined />
                Back to offers
              </Space>
            </Link>
          ),
        },
      ]}
    />
  )
}
