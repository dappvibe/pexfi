import { Button, Form, Input, List, Upload, message } from 'antd'
import React, { useState } from 'react'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import { useForm } from 'antd/lib/form/Form.js'
import { useContract } from '@/hooks/useContract'
import { useAccount } from 'wagmi'
import { equal } from '@/utils'

export default function MessageBox() {
  const { deal } = useDealContext()
  const [lockSubmit, setLockSubmit] = useState(false)
  const { address } = useAccount()
  const { signed } = useContract()
  const [form] = useForm()

  async function upload(file: File) {
    const reader = new FileReader()
    reader.addEventListener('load', () => send({ message: reader.result }))
    reader.readAsDataURL(file)
  }

  async function send(values) {
    setLockSubmit(true)
    try {
      const contract = await signed(deal.contract)
      return contract
        .message(values.message)
        .then(() => form.resetFields())
        .catch((e) => {
          let msg = e.info.message
          if (e.info.error.data.code == -32000) {
            msg = 'Message is too large.'
          }
          message.error(msg)
          throw e
        })
    } finally {
      setLockSubmit(false)
    }
  }

  function isParticipant(deal, address) {
    return [deal.taker.toLowerCase(), deal.offer.owner.toLowerCase()].includes(address.toLowerCase())
  }

  function renderMessage(msg) {
    const imageRegex = /^data:image\/[a-zA-Z]+;base64,/
    if (imageRegex.test(msg.message)) {
      return <img src={msg.message} alt="Message Image" style={{ maxWidth: '100%' }} />
    }
    return msg.message
  }

  if (address && isParticipant(deal, address)) {
    return (
      <>
        <List
          size="small"
          bordered
          dataSource={deal.messages}
          renderItem={(msg: any) => (
            <List.Item>
              <b>
                {equal(msg.sender, deal.taker) ? 'Taker' : equal(msg.sender, deal.offer.owner) ? 'Owner' : 'Mediator'}
              </b>
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
  } else return <h1>Please login to your wallet.</h1>
}
