import React from 'react'
import { Col, Input, Row, Select } from 'antd'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useInventory } from '@/shared/web3'

export default function OffersFilters({ setFilterAmount }) {
  const navigate = useNavigate()
  const { fiats, methods } = useInventory()
  const { side = 'sell', token = 'WETH', fiat: currentFiat = 'USD', method: currentMethod = undefined } = useParams()

  const labelStyle = {
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#cbc3d7',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    display: 'block'
  }

  const inputContainerStyle = {
    background: '#0e0e10',
    borderRadius: '12px',
    padding: '4px 16px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s'
  }

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <label style={labelStyle as any}>Amount</label>
        <div style={inputContainerStyle}>
          <Input
            placeholder="Min - Max"
            variant="borderless"
            style={{ color: '#e5e1e4', flex: 1, background: 'transparent' }}
            onChange={(e) => setFilterAmount(e.target.value)}
          />
          <Select
            className="dark-select"
            variant="borderless"
            style={{ width: 80 }}
            options={Object.keys(fiats).map((symbol) => ({ value: symbol, label: symbol }))}
            value={currentFiat}
            onChange={(fiat) =>
              navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat, method: currentMethod }))
            }
            dropdownStyle={{ background: '#201f22' }}
          />
        </div>
      </Col>
      <Col xs={24} md={12}>
        <label style={labelStyle as any}>Payment Method</label>
        <Select
          className="dark-select"
          placeholder="All Methods"
          style={{ width: '100%', background: '#0e0e10', borderRadius: '12px' }}
          allowClear
          showSearch
          variant="borderless"
          value={currentMethod}
          options={Object.keys(methods).map((method) => ({ value: method }))}
          onChange={(method) =>
            navigate(generatePath('/trade/:side/:token/:fiat/:method?', { side, token, fiat: currentFiat, method }))
          }
          size="large"
          dropdownStyle={{ background: '#201f22' }}
        />
      </Col>
    </Row>
  )
}
