import { useMemo } from 'react'
import { Button, Form, Input, Radio, Result, Skeleton } from 'antd'
import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { useDealFeedback } from '@/features/deals/hooks/useDealFeedback'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer'
import { useConnection, useWriteContract } from 'wagmi'
import { dealAbi } from '@/wagmi'
import { equal } from '@/utils'

export default function Feedback() {
  const { deal } = useDeal()
  const initialFeedback = useMemo(() => ({
    forOwner: deal?.feedbackForOwner,
    forTaker: deal?.feedbackForTaker,
  }), [deal?.feedbackForOwner, deal?.feedbackForTaker])

  const { feedback, setFeedback } = useDealFeedback(deal?.address, deal?.taker, initialFeedback)
  const { offer } = useQueryOffer(deal?.offer)
  const { address: account } = useConnection()
  const { writeContractAsync, isPending } = useWriteContract()
  const [form] = Form.useForm()

  if (!account || !offer) return <Skeleton active />

  const isOwner = equal(account, offer.owner)
  const isTaker = equal(account, deal.taker)

  const feedbackGiven = isOwner ? feedback.forTaker?.given : isTaker ? feedback.forOwner?.given : false

  async function submit() {
    const hash = await writeContractAsync({
      address: deal.address,
      abi: dealAbi,
      functionName: 'feedback',
      args: [form.getFieldValue('good'), form.getFieldValue('comments') || ''],
    })

    if (hash) {
      const fb = { given: true, upvote: form.getFieldValue('good') }
      setFeedback((prev) => ({
        ...prev,
        ...(isOwner ? { forTaker: fb } : { forOwner: fb }),
      }))
    }
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
