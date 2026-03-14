import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space } from 'antd'
import type { FormInstance } from 'antd'
import type { Token, Fiat, Method } from '@/shared/web3'

const { TextArea } = Input

interface EditOfferFormProps {
  offer: any
  form: FormInstance
  tokens: Record<string, Token>
  fiats: Record<string, Fiat>
  methods: Record<string, Method>
  onRateChange: () => void
  previewPrice: () => void
  handleSetRate: () => Promise<void>
  handleSetLimits: () => Promise<void>
  handleSetTerms: () => Promise<void>
  handleToggleDisabled: () => Promise<void>
}

const required = [{ required: true, message: 'required' }]

export default function EditOfferForm({
  offer,
  form,
  tokens,
  fiats,
  methods,
  onRateChange,
  previewPrice,
  handleSetRate,
  handleSetLimits,
  handleSetTerms,
  handleToggleDisabled,
}: EditOfferFormProps) {
  return (
    <Form form={form} layout={'horizontal'} colon={false}>
      <Row>
        <Col>
          <Space wrap size={'middle'}>
            <Form.Item
              name="isSell"
              label={'I want to'}
              rules={required}
              initialValue={offer.isSell}
            >
              <Radio.Group disabled>
                <Radio.Button value={false}>Buy</Radio.Button>
                <Radio.Button value={true}>Sell</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="token"
              label={'token'}
              rules={required}
              initialValue={offer.token?.symbol}
            >
              <Select showSearch style={{ width: 85 }} onChange={onRateChange} disabled>
                {Object.keys(tokens).map((key) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="fiat"
              label={'for'}
              rules={required}
              initialValue={offer.fiat}
            >
              <Select showSearch style={{ width: 85 }} onChange={onRateChange} disabled>
                {Object.keys(fiats).map((symbol) => (
                  <Select.Option key={symbol} value={symbol}>
                    {symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="method"
              label={'using'}
              rules={required}
              initialValue={offer.method}
            >
              <Select showSearch placeholder={'Payment method'} disabled>
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
              initialValue={(offer.rate - 1) * 100}
            >
              <InputNumber
                style={{ width: 120 }}
                changeOnWheel
                step={'0.01'}
                addonAfter={'%'}
                onChange={previewPrice}
              />
            </Form.Item>
            <Form.Item name={'preview'}>
              <Input style={{ width: 150 }} prefix={'~'} suffix={form.getFieldValue('fiat')} disabled />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleSetRate}>Update</Button>
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col>
          <Space>
            <Form.Item name="min" label="Limits" rules={required} initialValue={offer.min}>
              <Input style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name={'max'} label={'-'} rules={required} initialValue={offer.max}>
              <Input style={{ width: 120 }} />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleSetLimits}>Update</Button>
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Form.Item name="terms" label="Terms" initialValue={offer.terms}>
        <TextArea rows={4} placeholder={'Written in blockchain. Keep it short.'} />
      </Form.Item>
      <Form.Item>
        <Button onClick={handleSetTerms}>Update</Button>
      </Form.Item>
      <Form.Item>
        <Button onClick={handleToggleDisabled}>
          {offer.disabled ? 'Enable' : 'Disable'}
        </Button>
      </Form.Item>
    </Form>
  )
}
