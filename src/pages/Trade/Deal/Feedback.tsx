import { Button, Form, Input, Radio, Result } from 'antd'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import { useEffect, useState } from 'react'
import { useContract } from '@/hooks/useContract'
import { useAccount } from 'wagmi'

export default function Feedback() {
  const { deal } = useDealContext()
  const { address: account } = useAccount()
  const { signed } = useContract()
  const [given, setGiven] = useState(false)

  useEffect(() => {
    if (!account) return

    if (deal.taker.toLowerCase() === account.toLowerCase()) {
      deal.contract.feedbackForOwner().then((res) => setGiven(res[0]))
    }
    if (deal.offer.owner.toLowerCase() === account.toLowerCase()) {
      deal.contract.feedbackForTaker().then((res) => setGiven(res[0]))
    }
  }, [account])

  const [form] = Form.useForm()
  async function submit() {
    const contract = await signed(deal.contract)
    await contract.feedback(form.getFieldValue('good'), form.getFieldValue('comments'))
    setGiven(true)
  }

  if (!account) return
  if (given) {
    return <Result status={'success'} title={'Feedback submitted!'} />
  }

  return (
    <Form form={form} onFinish={submit}>
      <Form.Item name={'good'} rules={[{ required: true, message: 'Required' }]}>
        <Radio.Group buttonStyle={'solid'}>
          <Radio.Button value={1}>Good</Radio.Button>
          <Radio.Button value={0}>Bad</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item name={'comments'}>
        <Input.TextArea placeholder={'Comments'} />
      </Form.Item>
      <Form.Item>
        <Button type={'primary'} htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
