import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { useMemo, useRef, useEffect } from 'react'
import { useConnection } from 'wagmi'
import { useQueryOffer } from '@/features/offers/hooks/useQueryOffer'
import { equal } from '@/utils'
import { Button, Input, Skeleton } from 'antd'

export default function MessageBox() {
  const { deal, messages, sendMessage, isSending } = useDeal()
  const { address } = useConnection()
  const { offer } = useQueryOffer(deal?.offer)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const counterparty = useMemo(() => {
    if (!deal || !offer || !address) return ''
    return equal(offer.owner, address) ? deal.taker : offer.owner
  }, [address, deal, offer])

  if (!deal || !offer) return <Skeleton active />

  return (
    <div style={{
      background: '#1c1b1d',
      borderRadius: '16px',
      border: '1px solid rgba(73, 68, 84, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(73, 68, 84, 0.1)',
        background: '#131315',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e1e4' }}>Chat with Merchant</span>
        </div>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#cbc3d7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ID: #{deal.address.slice(2, 8).toUpperCase()}
        </span>
      </div>

      {/* Messages Area */}
      <div style={{
        flexGrow: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'rgba(14, 14, 16, 0.3)'
      }}>
        {messages?.map((msg, i) => {
          const isMe = equal(msg.sender, address || '')
          return (
            <div key={i} style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: isMe ? '4px' : '16px',
                borderTopLeftRadius: isMe ? '16px' : '4px',
                background: isMe ? 'rgba(208, 188, 255, 0.1)' : '#2a2a2c',
                border: isMe ? '1px solid rgba(208, 188, 255, 0.1)' : 'none',
                color: '#e5e1e4',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {msg.message}
              </div>
              <span style={{ 
                fontSize: '0.625rem', 
                color: '#cbc3d7', 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                margin: '0 4px'
              }}>
                {new Date(msg.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', background: '#131315', borderTop: '1px solid rgba(73, 68, 84, 0.1)' }}>
        <form onSubmit={(e) => {
          e.preventDefault()
          const input = (e.target as any).message
          if (input.value.trim()) {
            sendMessage(input.value)
            input.value = ''
          }
        }} style={{ display: 'flex', gap: '8px', background: '#0e0e10', borderRadius: '12px', padding: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Input
            name="message"
            placeholder="Type a message..."
            variant="borderless"
            style={{ flexGrow: 1, color: '#e5e1e4', fontSize: '0.875rem' }}
            disabled={isSending}
          />
          <Button
            htmlType="submit"
            loading={isSending}
            style={{
              background: 'rgba(208, 188, 255, 0.1)',
              border: 'none',
              color: '#d0bcff',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}>send</span>
          </Button>
        </form>
        <p style={{ fontSize: '0.625rem', color: '#cbc3d7', textAlign: 'center', marginTop: '12px', opacity: 0.5 }}>
          Encrypted P2P Communication
        </p>
      </div>
    </div>
  )
}
