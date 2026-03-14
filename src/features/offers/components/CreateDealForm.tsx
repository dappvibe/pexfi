import { Button, Form, Input, Space, Select } from 'antd'

interface CreateDealFormProps {
  offer: any
  form: any
  lockButton: boolean
  submitLabel: string
  submitDisabled: boolean
  onFinish: (values: any) => void
  syncTokenAmount: (fiat: string) => void
  syncFiatAmount: (token: string) => void
}

export default function CreateDealForm({
  offer,
  form,
  lockButton,
  submitLabel,
  submitDisabled,
  onFinish,
  syncTokenAmount,
  syncFiatAmount,
}: CreateDealFormProps) {
  return (
    <Form autoComplete={'off'} form={form} onFinish={onFinish}>
      <Space>
        <Form.Item name={'tokenAmount'}>
          <Input
            placeholder={'Crypto Amount'}
            suffix={offer.token?.symbol}
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
      {offer.availableMethods?.length > 0 && (
        <Form.Item
          name={'method'}
          label={'Payment Method'}
          rules={[{ required: true, message: 'Please select a payment method' }]}
          initialValue={offer.availableMethods[0].index}
        >
          <Select placeholder={'Select payment method'}>
            {offer.availableMethods.map((m: any) => (
              <Select.Option key={m.index} value={m.index}>
                {m.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item name={'paymentInstructions'}>
        <Input.TextArea placeholder={'Payment instructions'} disabled={offer.disabled} />
      </Form.Item>
      <Form.Item>
        <Button type={'primary'} htmlType="submit" loading={lockButton} disabled={submitDisabled}>
          {submitLabel}
        </Button>
      </Form.Item>
    </Form>
  )
}
