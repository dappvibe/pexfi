import { Button, Form, Input, Radio, Result, Skeleton } from 'antd'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import { useAccount, useWriteContract } from 'wagmi'
import { dealAbi } from '@/wagmi'
import { equal } from '@/utils'

export default function Feedback() {
  const { deal, offer } = useDealContext()
  const { address: account } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const [form] = Form.useForm()

  if (!account || !offer) return <Skeleton active />

  const isOwner = equal(account, offer.owner)
  const isTaker = equal(account, deal.taker)

  const feedbackGiven = isOwner ? deal.feedbackForTaker?.given : isTaker ? deal.feedbackForOwner?.given : false

  async function submit() {
    await writeContractAsync({
      address: deal.address,
      abi: dealAbi,
      functionName: 'feedback',
      args: [form.getFieldValue('good'), form.getFieldValue('comments') || ''],
    })
  }

  if (feedbackGiven) {
    return <Result status={'success'} title={'Feedback submitted!'} />
  }

  return (
    <Form form={form} onFinish={submit}>
      <Form.Item name={'good'} rules={[{ required: true, message: 'Required' }]}>
        <Radio.Group buttonStyle={'solid'}>
          <Radio.Button value={true}>Good</Radio.Button>
          <Radio.Button value={false}>Bad</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item name={'comments'}>
        <Input.TextArea placeholder={'Comments'} />
      </Form.Item>
      <Form.Item>
        <Button type={'primary'} htmlType="submit" loading={isPending}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}
