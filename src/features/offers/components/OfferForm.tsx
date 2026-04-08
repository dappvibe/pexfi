import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space } from 'antd'

const { TextArea } = Input

interface OfferFormProps {
  offer?: any
  form: any
  tokens: Record<string, any>
  fiats: Record<string, any>
  methods: Record<string, any>
  lockSubmit: boolean
  createOffer: (values: any) => Promise<void>
  fetchRate: () => void
  previewPrice: () => void
  handleSetRate?: () => Promise<void>
  handleSetLimits?: () => Promise<void>
  handleSetTerms?: () => Promise<void>
  handleToggleDisabled?: () => Promise<void>
}

const required = [{ required: true, message: 'required' }]

export default function OfferForm({
  offer = null,
  form,
  tokens,
  fiats,
  methods,
  lockSubmit,
  createOffer,
  fetchRate,
  previewPrice,
  handleSetRate,
  handleSetLimits,
  handleSetTerms,
  handleToggleDisabled,
}: OfferFormProps) {
  const inputStyle = {
    background: '#0e0e10', // surface-container-lowest
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    color: '#e5e1e4',
    fontSize: '1rem',
  }

  const labelStyle = {
    color: '#cbc3d7',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    marginBottom: '12px',
    display: 'block'
  }

  const sectionStyle = {
    marginBottom: '40px'
  }

  const primaryButtonStyle = {
    background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
    border: 'none',
    height: '56px',
    borderRadius: '12px',
    fontWeight: 700,
    color: '#3c0091',
    fontSize: '1rem',
    width: '100%',
    marginTop: '16px'
  }

  const isSellValue = Form.useWatch('isSell', form)
  const previewValue = Form.useWatch('preview', form)
  const fiatValue = Form.useWatch('fiat', form)
  const tokenValue = Form.useWatch('token', form)

  return (
    <Form
      form={form}
      layout={'vertical'}
      onFinish={createOffer}
      colon={false}
      onLoad={offer ? fetchRate : undefined}
      requiredMark={false}
    >
      {/* Type Toggle Section */}
      <section style={sectionStyle}>
        <label style={labelStyle as any}>Transaction Direction</label>
        <Form.Item name="isSell" rules={required} initialValue={offer ? offer.isSell : false}>
          <Radio.Group disabled={!!offer} id="isSell" style={{ width: '100%', display: 'flex', background: '#0e0e10', padding: '6px', borderRadius: '12px' }}>
            <Radio.Button value={false} style={{ flex: 1, textAlign: 'center', height: '48px', lineHeight: '48px', borderRadius: '8px', border: 'none', background: !isSellValue ? '#353437' : 'transparent', color: !isSellValue ? '#d0bcff' : '#cbc3d7', fontWeight: 700 }}>Buy</Radio.Button>
            <Radio.Button value={true} style={{ flex: 1, textAlign: 'center', height: '48px', lineHeight: '48px', borderRadius: '8px', border: 'none', background: isSellValue ? '#353437' : 'transparent', color: isSellValue ? '#d0bcff' : '#cbc3d7', fontWeight: 700 }}>Sell</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </section>

      {/* Selection Grid */}
      <section style={sectionStyle}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="token" label={<span style={labelStyle as any}>token</span>} rules={required} initialValue={offer ? offer.token?.symbol : undefined}>
              <Select aria-label="token" showSearch onChange={fetchRate} disabled={!!offer} style={{ width: '100%' }} dropdownStyle={{ background: '#201f22' }} size="large" placeholder="Select Token">
                {Object.keys(tokens).map((key) => (
                  <Select.Option key={key} value={key} title={key}>{key}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fiat" label={<span style={labelStyle as any}>fiat currency</span>} rules={required} initialValue={offer ? offer.fiat : undefined}>
              <Select aria-label="for" showSearch onChange={fetchRate} disabled={!!offer} style={{ width: '100%' }} dropdownStyle={{ background: '#201f22' }} size="large" placeholder="Select Fiat">
                {Object.keys(fiats).map((symbol) => (
                  <Select.Option key={symbol} value={symbol} title={symbol}>{symbol}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </section>

      {/* Payment Method */}
      <section style={sectionStyle}>
        <Form.Item name="method" label={<span style={labelStyle as any}>payment method</span>} rules={required} initialValue={offer ? offer.method : undefined}>
          <Select aria-label="using" showSearch placeholder={'Select payment method'} disabled={!!offer} style={{ width: '100%' }} dropdownStyle={{ background: '#201f22' }} size="large">
            {Object.keys(methods).map((key) => (
              <Select.Option key={key} value={key} title={key}>{key}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </section>

      {/* Pricing Section */}
      <Form.Item name="preview" hidden><Input /></Form.Item>
      <section style={{ ...sectionStyle, background: 'rgba(53, 52, 55, 0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(73, 68, 84, 0.1)' }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Form.Item name="rate" label={<span style={{ ...labelStyle, fontSize: '0.7rem' } as any}>Margin / Rate %</span>} rules={required} initialValue={offer ? (offer.rate - 1) * 100 : undefined}>
              <InputNumber
                aria-label="Margin"
                style={{ width: '100%', background: '#0e0e10', border: 'none', height: '56px', borderRadius: '12px', fontSize: '1.5rem', fontWeight: 900, color: '#d0bcff' }}
                changeOnWheel
                step={'0.01'}
                addonAfter={<span style={{ color: '#d0bcff', fontWeight: 700 }}>%</span>}
                onChange={previewPrice}
              />
            </Form.Item>
            <p style={{ fontSize: '0.625rem', fontWeight: 500, color: '#cbc3d7', textTransform: 'uppercase', tracking: '0.05em', marginTop: '-12px' }}>Above market price</p>
          </Col>
          <Col span={12} style={{ textAlign: 'right', borderLeft: '1px solid rgba(73, 68, 84, 0.1)', paddingLeft: '24px' }}>
            <span style={{ ...labelStyle, marginBottom: '4px' } as any}>Resulting Price</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e5e1e4' }}>
              {previewValue || '0.00'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbc3d7' }}>{fiatValue || form.getFieldValue('fiat')} / {tokenValue || form.getFieldValue('token')}</div>
          </Col>
        </Row>
      </section>

      {/* Limits Section */}
      <section style={sectionStyle}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="min" label={<span style={labelStyle as any}>min fiat limit</span>} rules={required} initialValue={offer ? offer.min : undefined}>
              <Input aria-label="Limits" style={inputStyle} prefix={<span style={{ color: '#cbc3d7', fontWeight: 700 }}>$</span>} placeholder="100" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={'max'} label={<span style={labelStyle as any}>max fiat limit</span>} rules={required} initialValue={offer ? offer.max : undefined}>
              <Input aria-label="-" style={inputStyle} prefix={<span style={{ color: '#cbc3d7', fontWeight: 700 }}>$</span>} placeholder="2500" />
            </Form.Item>
          </Col>
        </Row>
      </section>

      {/* Terms Section */}
      <section style={sectionStyle}>
        <Form.Item name="terms" label={<span style={labelStyle as any}>trade terms & instructions</span>} initialValue={offer ? offer.terms : undefined}>
          <TextArea aria-label="Terms" rows={4} placeholder={'Enter your trading rules...'} style={inputStyle} />
        </Form.Item>
      </section>

      {/* Actions */}
      <div style={{ 
        margin: '0 -32px -32px -32px',
        padding: '24px 32px',
        background: '#201f22',
        borderTop: '1px solid rgba(73, 68, 84, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbc3d7', fontSize: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>info</span>
          Escrow contract will be deployed upon offer publication.
        </div>
        
        {offer ? (
          <Space size="middle">
             <Button style={{ height: '48px', borderRadius: '12px', background: '#353437', border: 'none', color: '#e5e1e4', fontWeight: 600, padding: '0 24px' }} onClick={handleSetRate}>Update Rate</Button>
             <Button style={{ height: '48px', borderRadius: '12px', background: '#353437', border: 'none', color: '#e5e1e4', fontWeight: 600, padding: '0 24px' }} onClick={handleSetLimits}>Update Limits</Button>
             <Button style={{ height: '48px', borderRadius: '12px', background: '#353437', border: 'none', color: '#e5e1e4', fontWeight: 600, padding: '0 24px' }} onClick={handleSetTerms}>Update Terms</Button>
             <Button danger={!offer.disabled} style={{ height: '48px', borderRadius: '12px', fontWeight: 600, padding: '0 24px' }} onClick={handleToggleDisabled}>
              {offer.disabled ? 'Enable' : 'Disable'}
            </Button>
          </Space>
        ) : (
          <Button 
            loading={lockSubmit} 
            type="primary" 
            htmlType="submit" 
            style={{ ...primaryButtonStyle, width: 'auto', padding: '0 40px', marginTop: 0 }}
          >
            Deploy Contract
          </Button>
        )}
      </div>
    </Form>
  )
}
