import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Form, Input, message, Skeleton, Space } from 'antd'
import React, { useState } from 'react'
import Subnav from '@/pages/Trade/Offer/Subnav'
import Description from '@/pages/Trade/Offer/Description'
import OfferForm from '@/pages/Trade/Offer/OfferForm'
import { ethers } from 'ethers'
import { useContract } from '@/hooks/useContract'
import { useAccount } from 'wagmi'
import { useOffer } from './hooks/useOffer'

export default function OfferPage() {
  const navigate = useNavigate()
  const account = useAccount()
  const { Market, DealFactory, signed } = useContract()

  const { offerId } = useParams()
  const { offer, allowance, setAllowance, token, setRate, setLimits, setTerms, toggleDisabled } = useOffer(offerId, {
    fetchPrice: true,
    fetchAllowance: true,
  })
  const isOwner = offer?.owner?.toLowerCase() === account.address?.toLowerCase()

  async function approve() {
    if (allowance > 0 || offer.isSell) return Promise.resolve()

    const t = await signed(token)
    return t.approve(Market.target, ethers.MaxUint256).then((tx) => {
      tx.wait().then(() => {
        token.allowance(account.address, Market.target).then(setAllowance)
      })
    })
  }

  async function createDeal(offer, values) {
    setLockButton(true)
    await approve()

    const factory = await signed(DealFactory)
    const amount = BigInt(values['fiatAmount'] * 10 ** 6)

    try {
      const tx = await factory.create(offer.address, amount, values['paymentInstructions'] ?? '')
      message.info('Deal submitted. You will be redirected shortly.')
      const receipt = await tx.wait()
      // FIXME when user is refirected immediately subgraph did not index the deal yet which leads to page fail to load
      receipt.logs.forEach((log) => {
        const DealCreated = Market.interface.parseLog(log)
        if (DealCreated) {
          navigate(`/trade/deal/${DealCreated.args[3]}`)
        }
      })
      setLockButton(false)
    } catch (e) {
      if (token && e.data) {
        try {
          const error = token.interface.parseError(e.data)
          if (error.name === 'ERC20InsufficientBalance') {
            message.error(`Not enough ${offer.token}. You have ${error.args[1]}`)
          } else {
            message.error(e.shortMessage)
          }
        } catch (e2) {
          message.error(e.shortMessage)
        }
      } else {
        message.error(e.shortMessage)
      }
    }
    setLockButton(false)
  }

  const [form] = Form.useForm()
  const syncTokenAmount = (fiat) => {
    const value = fiat.length > 0 ? (fiat / offer.price).toFixed(8) : ''
    form.setFieldValue('tokenAmount', value)
  }
  const syncFiatAmount = (token) => {
    const value = token.length > 0 ? (token * offer.price).toFixed(2) : ''
    form.setFieldValue('fiatAmount', value)
    form.validateFields(['fiatAmount'])
  }

  const [lockButton, setLockButton] = useState(false)
  let submit = (
    <Button type={'primary'} htmlType="submit" loading={lockButton} disabled={!account}>
      Open Deal
    </Button>
  )
  if (offer && !offer.isSell) {
    if (!allowance) {
      submit = (
        <Button type={'primary'} htmlType="submit" loading={lockButton} disabled={!account}>
          Approve {offer.token}
        </Button>
      )
    }
  }
  if (offer && offer.disabled) {
    submit = (
      <Button type={'primary'} disabled>
        Offer is disabled
      </Button>
    )
  }

  if (!offer) return <Skeleton active />

  if (isOwner) {
    return (
      <Card title={'Update offer'}>
        <OfferForm
          offer={offer}
          setRate={setRate}
          setLimits={setLimits}
          setTerms={setTerms}
          toggleDisabled={toggleDisabled}
        />
      </Card>
    )
  }

  return (
    <>
      <Subnav offer={offer} />

      <Card
        title={`You are ${offer.isSell ? 'buying' : 'selling'} ${offer.token} for ${offer.fiat} using ${offer.method}`}
      >
        <Description offer={offer} />

        <Form autoComplete={'off'} form={form} onFinish={(values) => createDeal(offer, values)}>
          <Space>
            <Form.Item name={'tokenAmount'}>
              <Input
                placeholder={'Crypto Amount'}
                suffix={offer.token}
                disabled={offer.disabled}
                onChange={(e) => syncFiatAmount(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name={'fiatAmount'}
              rules={[
                { required: true, message: 'Required' },
                () => ({
                  validator(_, value) {
                    if (value < offer.min) {
                      return Promise.reject(`Min is ${offer.min} ${offer.fiat}`)
                    }
                    if (value > offer.max) {
                      return Promise.reject(`Max is ${offer.max} ${offer.fiat}`)
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Input
                placeholder={'Fiat Amount'}
                suffix={offer.fiat}
                disabled={offer.disabled}
                onChange={(e) => syncTokenAmount(e.target.value)}
              />
            </Form.Item>
          </Space>
          <Form.Item name={'paymentInstructions'}>
            <Input.TextArea placeholder={'Payment instructions'} disabled={offer.disabled} />
          </Form.Item>
          <Form.Item>{submit}</Form.Item>
        </Form>
      </Card>
    </>
  )
}
