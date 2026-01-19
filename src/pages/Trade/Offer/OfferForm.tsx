import { Button, Col, Form, Input, InputNumber, message, Radio, Row, Select, Skeleton, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { useContract } from '@/hooks/useContract'
import { useInventory } from '@/hooks/useInventory'

const { TextArea } = Input

interface OfferFormProps {
  offer?: any
  setRate?: (rate: number) => Promise<void>
  setLimits?: (min: number, max: number) => Promise<void>
  setTerms?: (terms: string) => Promise<void>
  toggleDisabled?: () => Promise<void>
}

interface SubmitButtonRef {
  setLoading: (loading: boolean) => void
}

const SubmitButton = forwardRef<SubmitButtonRef, {}>((_, ref) => {
  const [loading, setLoading] = React.useState(false)

  useImperativeHandle(ref, () => ({
    setLoading,
  }))

  return (
    <Form.Item>
      <Button loading={loading} type="primary" htmlType="submit">
        Deploy contract
      </Button>
    </Form.Item>
  )
})

export default function OfferForm({ offer = null, setRate, setLimits, setTerms, toggleDisabled }: OfferFormProps) {
  const navigate = useNavigate()
  const { Market, OfferFactory, signed } = useContract()
  const submitBtnRef = useRef<SubmitButtonRef>(null)
  const { tokens, fiats, methods } = useInventory()
  const marketPrice = useRef(null)
  const [form] = Form.useForm()

  if (fiats.length === 0) return <Skeleton active />

  async function handleSetRate() {
    if (!setRate) return
    try {
      await setRate(form.getFieldValue('rate'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update rate')
    }
  }

  async function handleSetLimits() {
    if (!setLimits) return
    try {
      await setLimits(form.getFieldValue('min'), form.getFieldValue('max'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update limits')
    }
  }

  async function handleSetTerms() {
    if (!setTerms) return
    try {
      await setTerms(form.getFieldValue('terms'))
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to update terms')
    }
  }

  async function handleToggleDisabled() {
    if (!toggleDisabled) return
    try {
      await toggleDisabled()
      message.success('Updated')
    } catch (e: any) {
      message.error(e.message || 'Failed to toggle state')
    }
  }

  async function submit(val) {
    // FIXME this causes rerender all form and selects flicker
    submitBtnRef.current?.setLoading(true)

    val.min = Math.floor(val.min)
    val.max = Math.ceil(val.max)
    val.rate = Math.floor((1 + val.rate / 100) * 10 ** 4)
    val.terms ??= ''

    const params = [val.isSell, val.token, val.fiat, val.method, val.rate, [val.min, val.max], val.terms]

    try {
      const factory = await signed(OfferFactory)
      // @ts-ignore
      const tx = await factory.create(...params)
      message.success('Offer submitted. You will be redirected shortly.')

      const receipt = await tx.wait()
      receipt.logs.forEach((log) => {
        const OfferCreated = Market.interface.parseLog(log)
        if (OfferCreated) {
          message.success('Offer created')
          navigate(`/trade/offer/${OfferCreated.args[3]}`)
        }
      })
    } finally {
      submitBtnRef.current?.setLoading(false)
    }
  }

  async function fetchRate() {
    const token = form.getFieldValue('token')
    const fiat = form.getFieldValue('fiat')
    if (token && fiat) {
      // FIXME store market rate somewhere, not from current
      let price: number | string = Number(await Market.getPrice(token, fiat))
      price = (price / 10 ** 6).toFixed(2)
      marketPrice.current = price
      previewPrice()
    }
  }

  async function previewPrice() {
    const ratio = form.getFieldValue('rate') ?? 0
    if (marketPrice.current) {
      // adjust price by ratio which is an unsigned percentage of margin from the current rate
      const current = marketPrice.current * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    } else fetchRate()
  }

  const required = [{ required: true, message: 'required' }]

  return (
    <Form form={form} layout={'horizontal'} onFinish={submit} colon={false} onLoad={offer ? fetchRate : undefined}>
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
            <Form.Item name="token" label={'token'} rules={required} initialValue={offer ? offer.token : undefined}>
              <Select showSearch style={{ width: 85 }} onChange={fetchRate} disabled={!!offer}>
                {Object.keys(tokens).map((key) => {
                  const token = tokens[key]
                  return (
                    <Select.Option key={token.address} value={token.symbol}>
                      {token.symbol}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item name="fiat" label={'for'} rules={required} initialValue={offer ? offer.fiat : undefined}>
              <Select showSearch style={{ width: 85 }} onChange={fetchRate} disabled={!!offer}>
                {fiats.map((symbol) => {
                  return (
                    <Select.Option key={symbol} value={symbol}>
                      {symbol}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item name="method" label={'using'} rules={required} initialValue={offer ? offer.method : undefined}>
              <Select showSearch placeholder={'Payment method'} disabled={!!offer}>
                {Object.keys(methods).map((key) => {
                  const method = methods[key]
                  return (
                    <Select.Option key={key} value={key}>
                      {method.name}
                    </Select.Option>
                  )
                })}
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
              initialValue={offer ? ((offer.rate - 1) * 100).toFixed(2) : undefined}
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
      {!offer && <SubmitButton ref={submitBtnRef} />}
    </Form>
  )
}
