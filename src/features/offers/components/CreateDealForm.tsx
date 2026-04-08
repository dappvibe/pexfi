import { Button, Form, Input, Select } from 'antd'

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
  const inputContainerStyle = {
    background: '#0e0e10',
    borderRadius: '12px',
    padding: '4px 16px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  }

  const labelStyle = {
    position: 'absolute' as const,
    top: '-10px',
    left: '16px',
    background: '#201f22',
    padding: '0 8px',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#cbc3d7',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    zIndex: 10
  }

  return (
    <Form autoComplete={'off'} form={form} onFinish={onFinish} layout="vertical">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* I will pay / receive based on offer.isSell */}
        {/* If offer.isSell = true (Maker Sells), Taker Buys (Pays Fiat, Receives Token) */}
        <div style={{ position: 'relative' }}>
          <label style={labelStyle}>{offer.isSell ? 'I will pay' : 'I will pay'}</label>
          <div style={inputContainerStyle}>
            <Form.Item name={'fiatAmount'} style={{ margin: 0, flex: 1 }} rules={[{ required: true, message: '' }]}>
              <Input
                placeholder={'0.00'}
                variant="borderless"
                disabled={offer.disabled}
                onChange={(e) => syncTokenAmount(e.target.value)}
                style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e5e1e4' }}
              />
            </Form.Item>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '1px', height: '24px', background: 'rgba(73, 68, 84, 0.3)' }} />
               <span style={{ fontWeight: 800, color: '#e5e1e4' }}>{offer.fiat}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '-16px 0', zIndex: 5 }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: '#201f22', 
            border: '1px solid rgba(73, 68, 84, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a078ff'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>swap_vert</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <label style={labelStyle}>I will receive</label>
          <div style={inputContainerStyle}>
            <Form.Item name={'tokenAmount'} style={{ margin: 0, flex: 1 }}>
              <Input
                placeholder={'0.00'}
                variant="borderless"
                disabled={offer.disabled}
                onChange={(e) => syncFiatAmount(e.target.value)}
                style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d0bcff' }}
              />
            </Form.Item>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '1px', height: '24px', background: 'rgba(73, 68, 84, 0.3)' }} />
               <span style={{ fontWeight: 800, color: '#e5e1e4' }}>{offer.token?.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {offer.availableMethods?.length > 0 && (
          <Form.Item
            name={'method'}
            label={<span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment Method</span>}
            rules={[{ required: true, message: 'Please select a payment method' }]}
            initialValue={offer.availableMethods[0].index}
          >
            <Select size="large" className="dark-select" placeholder={'Select payment method'} dropdownStyle={{ background: '#201f22' }}>
              {offer.availableMethods.map((m: any) => (
                <Select.Option key={m.index} value={m.index}>
                  {m.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </div>

      <Form.Item 
        name={'paymentInstructions'} 
        label={<span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Optional Message to Seller</span>}
      >
        <Input.TextArea 
          rows={3} 
          placeholder={'Add any specific instructions or questions...'} 
          disabled={offer.disabled} 
          style={{ background: '#0e0e10', border: 'none', borderRadius: '12px', color: '#e5e1e4', padding: '12px' }}
        />
      </Form.Item>

      <div style={{ 
        padding: '16px', 
        background: 'rgba(255, 180, 171, 0.05)', 
        border: '1px solid rgba(255, 180, 171, 0.1)', 
        borderRadius: '12px',
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <span className="material-symbols-outlined" style={{ color: '#ffb4ab', fontSize: '1.25rem' }}>warning</span>
        <p style={{ fontSize: '0.75rem', color: '#cbc3d7', margin: 0, lineHeight: '1.5' }}>
          <strong style={{ color: '#ffb4ab' }}>Important:</strong> This trade will lock the assets in a smart contract escrow. Ensure your payment method is ready before continuing.
        </p>
      </div>

      <Button 
        type={'primary'} 
        htmlType="submit" 
        loading={lockButton} 
        disabled={submitDisabled}
        style={{
          width: '100%',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
          border: 'none',
          color: '#3c0091',
          fontSize: '1.125rem',
          fontWeight: 800,
          boxShadow: '0 10px 30px rgba(160, 120, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
        {submitLabel}
      </Button>

      <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: '#cbc3d7', marginTop: '16px', opacity: 0.6 }}>
        By creating this deal, you agree to the CyberP2P Escrow Protocols.
      </p>
    </Form>
  )
}
