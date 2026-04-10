import { Modal, List, Typography, Space, Avatar } from 'antd'
import { useConnect, useConnectors, Connector } from 'wagmi'

const { Text } = Typography

interface ConnectWalletModalProps {
  open: boolean
  onCancel: () => void
}

export default function ConnectWalletModal({ open, onCancel }: ConnectWalletModalProps) {
  const { connect, isPending, error } = useConnect()
  const connectors = useConnectors()

  const handleConnect = (connector: Connector) => {
    connect({ connector }, {
      onSuccess: () => {
        onCancel()
      }
    })
  }

  return (
    <Modal
      title="Connect Wallet"
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      styles={{
        body: { padding: '12px 0' }
      }}
    >
      <List
        dataSource={connectors}
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
      {error && (
        <div style={{ padding: '0 24px 12px', color: '#ff4d4f' }}>
          <Text type="danger">{error.message}</Text>
        </div>
      )}
    </Modal>
  )
}
