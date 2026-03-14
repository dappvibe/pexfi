import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space } from 'antd'
import type { FormInstance } from 'antd'
import type { Token, Fiat, Method } from '@/shared/web3'

const { TextArea } = Input

interface CreateOfferFormProps {
  form: FormInstance
  tokens: Record<string, Token>
  fiats: Record<string, Fiat>
  methods: Record<string, Method>
  lockSubmit: boolean
  onSubmit: (values: any) => Promise<void>
  onRateChange: () => void
  previewPrice: () => void
}

const required = [{ required: true, message: 'required' }]

export default function CreateOfferForm({
  form,
  tokens,
  fiats,
  methods,
  lockSubmit,
  onSubmit,
  onRateChange,
  previewPrice,
}: CreateOfferFormProps) {
  return (
    <Form form={form} layout={'horizontal'} onFinish={onFinish} colon={false}>
      <Row>
        <Col>
          <Space wrap size={'middle'}>
            <Form.Item name="isSell" label={'I want to'} rules={required}>
              <Radio.Group>
                <Radio.Button value={false}>Buy</Radio.Button>
                <Radio.Button value={true}>Sell</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="token" label={'token'} rules={required}>
              <Select showSearch style={{ width: 85 }} onChange={onRateChange}>
                {Object.keys(tokens).map((key) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="fiat" label={'for'} rules={required}>
              <Select showSearch style={{ width: 85 }} onChange={onRateChange}>
                {Object.keys(fiats).map((symbol) => (
                  <Select.Option key={symbol} value={symbol}>
                    {symbol}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="method" label={'using'} rules={required}>
              <Select showSearch placeholder={'Payment method'}>
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
            <Form.Item name="rate" label={'Margin'} rules={required}>
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
          </Space>
        </Col>
      </Row>
      <Row>
        <Col>
          <Space>
            <Form.Item name="min" label="Limits" rules={required}>
              <Input style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name={'max'} label={'-'} rules={required}>
              <Input style={{ width: 120 }} />
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Form.Item name="terms" label="Terms">
        <TextArea rows={4} placeholder={'Written in blockchain. Keep it short.'} />
      </Form.Item>
      <Form.Item>
        <Button loading={lockSubmit} type="primary" htmlType="submit">
          Deploy contract
        </Button>
      </Form.Item>
    </Form>
  )

  function onFinish(values: any) {
    onSubmit(values)
  }
}
