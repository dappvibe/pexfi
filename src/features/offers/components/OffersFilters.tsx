import React from 'react'
import { Input, Select, Space } from 'antd'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useInventory } from '@/shared/web3'

export default function OffersFilters({ setFilterAmount }) {
  const navigate = useNavigate()
  const { fiats, methods } = useInventory()
  const { side = 'sell', token = 'WETH', fiat = 'USD', method = undefined } = useParams()

  return (
    <Space>
      <Input
        placeholder={'Amount'}
        style={{ maxWidth: 200 }}
        allowClear
        onChange={(e) => setFilterAmount(e.target.value)}
        addonAfter={
          <Select
            placeholder="Search to Select"
            showSearch
            options={Object.keys(fiats).map((symbol) => ({ value: symbol, label: symbol }))}
            defaultValue={fiat}
            onChange={(fiat) =>
              navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat, method }))
            }
          />
        }
      />
      <Select
        placeholder="Payment method"
        style={{ width: 200 }}
        allowClear
        showSearch
        defaultValue={method}
        options={Object.keys(methods).map((method) => ({ value: method }))}
        onChange={(method) =>
          navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat, method }))
        }
      />
    </Space>
  )
}
