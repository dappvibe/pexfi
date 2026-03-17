import { useEffect } from 'react'
import { ConnectButton, darkTheme, useActiveWallet } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { useAccount, useChains, useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi'
import { thirdwebClient } from '@/wagmi.config.ts'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.brave.wallet'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
]

export default function WalletMenu() {
  const { mutate: connect } = useConnect()
  const connectors = useConnectors()
  const { mutate: disconnect } = useDisconnect()
  const { mutate: switchChain } = useSwitchChain()
  const chains = useChains()

  const { isConnected, isConnecting, isReconnecting, connector: activeConnector } = useAccount()
  const thirdwebWallet = useActiveWallet()

  const inAppConnector = connectors.find((c) => c.id === 'in-app-wallet' || c.type === 'inAppWallet')

  // Handle auto-reconnect on page reload
  // When thirdweb successfully auto-connects its session, this triggers Wagmi to adopt it
  useEffect(() => {
    if (thirdwebWallet && inAppConnector && !isConnected && !isConnecting && !isReconnecting) {
      // Connect wagmi using the inAppWalletConnector, passing the active thirdweb wallet instance
      // Type assertion is required because Wagmi's CreateConnectorFn doesn't natively expose the custom 'wallet' parameter
      // added by @thirdweb-dev/wagmi-adapter for state handoff.
      connect({ connector: inAppConnector, wallet: thirdwebWallet } as any)
    }
  }, [thirdwebWallet, inAppConnector, isConnected, isConnecting, isReconnecting, connect])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ConnectButton
        client={thirdwebClient}
        appMetadata={{
          name: 'PEXFI P2P',
          url: 'https://pexfi.com',
          description: 'onchain P2P marketplace',
        }}
        chains={chains}
        connectButton={{ className: 'wallet-connect-button', label: 'Connect' }}
        connectModal={{
          size: 'wide',
          showThirdwebBranding: false,
          title: 'Connect to PEXFI',
        }}
        detailsButton={{}}
        detailsModal={{
          assetTabs: ['token'],
          hideBuyFunds: true,
          manageWallet: { allowLinkingProfiles: false },
          showTestnetFaucet: true,
          networkSelector: {
            onSwitch: (chain) => switchChain({ chainId: chain.id }),
          },
        }}
        onConnect={(wallet) => {
          // Triggered on manual connection via modal
          if (inAppConnector) {
            connect({ connector: inAppConnector, wallet } as any)
          }
        }}
        onDisconnect={() => {
          // Only disconnect wagmi if it is currently connected via the Thirdweb adapter
          // Prevents disconnecting E2E test mock connectors
          if (activeConnector?.id === 'in-app-wallet' || activeConnector?.type === 'inAppWallet') {
            disconnect()
          }
        }}
        theme={darkTheme({})}
        wallets={wallets}
      />
    </div>
  )
}
