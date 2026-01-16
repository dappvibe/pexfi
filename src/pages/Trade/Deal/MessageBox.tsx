import { Button, Form, Input, List, message, Upload } from 'antd'
import React, { useState } from 'react'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import { useForm } from 'antd/lib/form/Form.js'
import { useAccount, useWriteContract } from 'wagmi'
import { equal } from '@/utils'
import { dealAbi } from '@/wagmi'

export default function MessageBox() {
  const { deal, offer } = useDealContext()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { address } = useAccount()
  const [form] = useForm()
  const { writeContractAsync } = useWriteContract()

  async function upload(file: File) {
    const reader = new FileReader()
    reader.addEventListener('load', () => send({ message: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function send(values: { message: string }) {
    setLockSubmit(true)
    try {
      await writeContractAsync({
        address: deal.address,
        abi: dealAbi,
        functionName: 'message',
        args: [values.message],
      })
      form.resetFields()
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'Failed to send message'
      message.error(msg.includes('gas') ? 'Message is too large.' : msg)
    } finally {
      setLockSubmit(false)
    }
  }

  function isParticipant() {
    if (!address || !offer) return false
    return equal(deal.taker, address) || equal(offer.owner, address)
  }

  function renderMessage(msg: { sender: string; message: string }) {
    const imageRegex = /^data:image\/[a-zA-Z]+;base64,/
    if (imageRegex.test(msg.message)) {
      return <img src={msg.message} alt="Message Image" style={{ maxWidth: '100%' }} />
    }
    return msg.message
  }

  function getSenderLabel(sender: string) {
    if (equal(sender, deal.taker)) return 'Taker'
    if (offer && equal(sender, offer.owner)) return 'Owner'
    return 'Mediator'
  }

  if (!address || !isParticipant()) {
    return <h1>Please login to your wallet.</h1>
  }

  return (
    <>
      <List
        size="small"
        bordered
        dataSource={deal.messages}
        renderItem={(msg) => (
          <List.Item>
            <b>{getSenderLabel(msg.sender)}</b>
            {': '}
            {renderMessage(msg)}
          </List.Item>
        )}
      />
      <Form onFinish={send} form={form}>
        <Form.Item name="message" rules={[{ required: true, message: 'Required' }]}>
          <Input.TextArea placeholder={'Message'} />
        </Form.Item>
        <Form.Item>
          <Button type={'primary'} htmlType={'submit'} loading={lockSubmit}>
            Send
          </Button>
          <Upload beforeUpload={upload} accept="image/*" showUploadList={false}>
            <Button>Upload Image</Button>
          </Upload>
        </Form.Item>
      </Form>
    </>
  )
}
