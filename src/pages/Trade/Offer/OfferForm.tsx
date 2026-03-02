import { Button, Col, Form, Input, InputNumber, message, Radio, Row, Select, Skeleton, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { padHex, stringToHex } from 'viem'
import { useInventory } from '@/hooks/useInventory'
import { useReadMarketGetPrice, useWriteMarketCreateOffer, useWatchMarketOfferCreatedEvent } from '@/wagmi'
import { useAddress } from '@/hooks/useAddress'
import { useAccount } from 'wagmi'

const { TextArea } = Input

interface OfferFormProps {
  offer?: any
  setRate?: (rate: number) => Promise<void>
  setLimits?: (min: number, max: number) => Promise<void>
  setTerms?: (terms: string) => Promise<void>
  toggleDisabled?: () => Promise<void>
}

export default function OfferForm({ offer = null, setRate, setLimits, setTerms, toggleDisabled }: OfferFormProps) {
  const navigate = useNavigate()
  const account = useAccount()
  const marketAddress = useAddress('Market#Market')
  const { writeContractAsync: createOffer } = useWriteMarketCreateOffer()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { tokens, fiats, methods } = useInventory()
  const [form] = Form.useForm()

  const [isSubmitting, setIsSubmitting] = useState(false)

  useWatchMarketOfferCreatedEvent({
    address: marketAddress,
    onLogs(logs) {
      if (!isSubmitting) return
      
      logs.forEach(log => {
        const { owner, offer: newOfferAddress } = log.args
        if (owner?.toLowerCase() === account.address?.toLowerCase()) {
          setIsSubmitting(false)
          navigate(`/trade/offer/${newOfferAddress}`)
        }
      })
    },
  })

  const [rateParams, setRateParams] = useState<{ token: `0x${string}`, fiat: `0x${string}` } | null>(null)
  const { data: priceData } = useReadMarketGetPrice({
    address: marketAddress,
    args: rateParams ? [rateParams.token, rateParams.fiat] : undefined,
    query: {
      enabled: !!rateParams,
    }
  })

  useEffect(() => {
    if (priceData) {
      const price = (Number(priceData) / 10 ** 6).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    }
  }, [priceData, form])

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

  async function onFinish(val) {
    setLockSubmit(true)

    val.min = Math.floor(val.min)
    val.max = Math.ceil(val.max)
    val.rate = Math.floor((1 + val.rate / 100) * 10 ** 4)
    val.terms ??= ''

    const params = {
      isSell: val.isSell,
      token: tokens[val.token].address,
      fiat: padHex(stringToHex(val.fiat), { size: 3, dir: 'right' }),
      methods: 1n << BigInt(methods[val.method].index),
      rate: val.rate,
      limits: { min: val.min, max: val.max },
      terms: val.terms,
    }

    try {
      setIsSubmitting(true)
      await createOffer({
        address: marketAddress,
        args: [params],
      })
      message.success('Offer submitted. You will be redirected shortly.')
    } catch (e: any) {
      setIsSubmitting(false)
      console.error('Submission error:', e)
      message.error(e.shortMessage || e.message || 'Failed to submit offer')
    } finally {
      setLockSubmit(false)
    }
  }

  async function fetchRate() {
    const symbol = form.getFieldValue('token')
    const fiat = form.getFieldValue('fiat')
    if (symbol && fiat) {
      const token = tokens[symbol]
      if (!token) return

      const fiatBytes3 = padHex(stringToHex(fiat), { size: 3, dir: 'right' })
      setRateParams({ token: token.address, fiat: fiatBytes3 })
    }
  }

  async function previewPrice() {
    if (priceData) {
      const price = (Number(priceData) / 10 ** 6).toFixed(2)
      const ratio = form.getFieldValue('rate') ?? 0
      const current = Number(price) * (1 + ratio / 100)
      form.setFieldValue('preview', current.toFixed(2))
    } else fetchRate()
  }

  const required = [{ required: true, message: 'required' }]

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
            <Form.Item name="token" label={'token'} rules={required} initialValue={offer ? offer.token : undefined}>
              <Select showSearch style={{ width: 85 }} onChange={fetchRate} disabled={!!offer}>
                {Object.keys(tokens).map((key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {key}
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
                  return (
                    <Select.Option key={key} value={key}>
                      {key}
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
