import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { Button } from 'antd'
import { useConnectWallet } from '@web3-onboard/react'

export default function WalletMenu() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()
  const [{ wallet }, connectWallet] = useConnectWallet()

  const _isE2E = () => { try { return typeof window !== 'undefined' && ((window as any).webdriver || window.navigator?.webdriver) } catch(e) { return false } }

  const handleConnect = async () => {
    if (_isE2E()) {
      const e2eConnector = connectors.find((c) => c.id === 'e2e-wallet' || c.name === 'E2E Wallet' || c.type === 'mock')
      if (e2eConnector) {
        connect({ connector: e2eConnector })
      }
    } else {
      await connectWallet()
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {!isConnected && (
        <Button
          type="primary"
          className="wallet-connect-button"
          onClick={handleConnect}
        >
          Connect
        </Button>
      )}
      {isConnected && address && (
        <Button
          type="default"
          onClick={handleDisconnect}
        >
          Disconnect {address.substring(0, 6)}...{address.substring(38)}
        </Button>
      )}
    </div>
  )
}
