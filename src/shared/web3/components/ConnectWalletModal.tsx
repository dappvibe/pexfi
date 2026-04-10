import { Modal, List, Typography, Space, Avatar, Button } from 'antd'
import { useConnect, useConnectors, Connector } from 'wagmi'
import { GlobalOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface ConnectWalletModalProps {
  open: boolean
  onCancel: () => void
}

export default function ConnectWalletModal({ open, onCancel }: ConnectWalletModalProps) {
  const { connect, isPending, error } = useConnect()
  const connectors = useConnectors()

  // Filter out generic "Injected" if there are other specific connectors
  // Also ensure we only show connectors that are actually ready/installed
  const filteredConnectors = connectors.filter((c, index, self) => {
    // Deduplicate by name first
    if (self.findIndex(t => t.name === c.name) !== index) return false

    // If it's the generic injected connector, only show it if it's the ONLY one
    // and it has been identified as something specific (e.g. wagmi detected MetaMask)
    if (c.id === 'injected') {
      const hasSpecificConnectors = self.some(conn => conn.id !== 'injected')
      if (hasSpecificConnectors) return false
      
      // "Injected" name usually means it's a generic fallback with no provider found
      if (c.name === 'Injected') return false
    }
    
    return true
  })

  const handleConnect = (connector: Connector) => {
    connect({ connector }, {
      onSuccess: () => {
        onCancel()
      }
    })
  }

  // Filter out "Provider not found" errors as they are confusing to users
  // especially when we show the "No Wallet Detected" UI instead.
  const displayError = error?.message?.includes('Provider not found') ? null : error

  return (
    <Modal
      title="Connect Wallet"
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      styles={{
        body: { padding: filteredConnectors.length > 0 ? '12px 0' : '24px' }
      }}
    >
      {filteredConnectors.length > 0 ? (
        <List
          dataSource={filteredConnectors}
          renderItem={(connector) => (
            <List.Item
              key={connector.uid}
              style={{ padding: '8px 24px', cursor: 'pointer' }}
              onClick={() => handleConnect(connector)}
              className="wallet-list-item"
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Avatar 
                    src={connector.icon} 
                    shape="square" 
                    size="small"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  />
                  <Text strong>{connector.name}</Text>
                </Space>
                {isPending && <Text type="secondary">Connecting...</Text>}
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <GlobalOutlined style={{ fontSize: '48px', color: '#d0bcff', marginBottom: '16px' }} />
          <Title level={5}>No Wallet Detected</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
            To trade on PEXFI, you need a crypto wallet. We recommend using Brave Browser with its built-in wallet.
          </Text>
          <Button 
            type="primary" 
            block 
            href="https://brave.com/" 
            target="_blank"
            style={{ 
              height: '48px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              border: 'none',
              fontWeight: 700,
              color: '#3c0091'
            }}
          >
            Get Brave Browser
          </Button>
        </div>
      )}
      
      {displayError && (
        <div style={{ padding: '12px 24px', color: '#ff4d4f' }}>
          <Text type="danger">{displayError.message}</Text>
        </div>
      )}
    </Modal>
  )
}
