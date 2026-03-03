import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space } from 'antd'

const { TextArea } = Input

interface OfferFormProps {
  offer?: any
  form: any
  tokens: Record<string, any>
  fiats: string[]
  methods: Record<string, any>
  lockSubmit: boolean
  onFinish: (values: any) => Promise<void>
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
  onFinish,
  fetchRate,
  previewPrice,
  handleSetRate,
  handleSetLimits,
  handleSetTerms,
  handleToggleDisabled,
}: OfferFormProps) {
  return (
    <Form form={form} layout={'horizontal'} onFinish={onFinish} colon={false} onLoad={offer ? fetchRate : undefined}>
      <Row>
        <Col>
          <Space wrap size={'middle'}>
            <Form.Item
              name="isSell"
              label={'I want to'}
              rules={required}
              initialValue={offer ? offer.isSell : undefined}
            >
              <Radio.Group disabled={!!offer}>
                <Radio.Button value={false}>Buy</Radio.Button>
                <Radio.Button value={true}>Sell</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="token" label={'token'} rules={required} initialValue={offer ? offer.token?.symbol : undefined}>
              <Select showSearch style={{ width: 85 }} onChange={fetchRate} disabled={!!offer}>
                {Object.keys(tokens).map((key) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="fiat" label={'for'} rules={required} initialValue={offer ? offer.fiat : undefined}>
              <Select showSearch style={{ width: 85 }} onChange={fetchRate} disabled={!!offer}>
                {fiats.map((symbol) => (
                  <Select.Option key={symbol} value={symbol}>
                    {symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="method" label={'using'} rules={required} initialValue={offer ? offer.method : undefined}>
              <Select showSearch placeholder={'Payment method'} disabled={!!offer}>
                {Object.keys(methods).map((key) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col>
          <Space direction={'horizontal'}>
            <Form.Item
              name="rate"
              label={'Margin'}
              rules={required}
              initialValue={offer ? (offer.rate - 1) * 100 : undefined}
            >
              <InputNumber
                style={{ width: 120 }}
                changeOnWheel
                step={'0.01'}
                addonAfter={'%'}
                onChange={previewPrice}
              />
            </Form.Item>
            <Form.Item name={'preview'} initialValue={offer ? previewPrice() : undefined}>
              <Input style={{ width: 150 }} prefix={'~'} suffix={form.getFieldValue('fiat')} disabled />
            </Form.Item>
            {offer && (
              <Form.Item>
                <Button onClick={handleSetRate}>Update</Button>
              </Form.Item>
            )}
          </Space>
        </Col>
      </Row>
      <Row>
        <Col>
          <Space>
            <Form.Item name="min" label="Limits" rules={required} initialValue={offer ? offer.min : undefined}>
              <Input style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name={'max'} label={'-'} rules={required} initialValue={offer ? offer.max : undefined}>
              <Input style={{ width: 120 }} />
            </Form.Item>
            {offer && (
              <Form.Item>
                <Button onClick={handleSetLimits}>Update</Button>
              </Form.Item>
            )}
          </Space>
        </Col>
      </Row>
      <Form.Item name="terms" label="Terms" initialValue={offer ? offer.terms : undefined}>
        <TextArea rows={4} placeholder={'Written in blockchain. Keep it short.'} />
      </Form.Item>
      {offer && (
        <>
          <Form.Item>
            <Button onClick={handleSetTerms}>Update</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleToggleDisabled}>{offer.disabled ? 'Enable' : 'Disable'}</Button>
          </Form.Item>
        </>
      )}
      {!offer && (
        <Form.Item>
          <Button loading={lockSubmit} type="primary" htmlType="submit">
            Deploy contract
          </Button>
        </Form.Item>
      )}
    </Form>
  )
}
