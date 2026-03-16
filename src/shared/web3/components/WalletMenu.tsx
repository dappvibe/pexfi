import { ConnectButton, darkTheme } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { useChains, useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi'
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

  const connector = connectors.find((c) => c.id === 'in-app-wallet' || c.type === 'inAppWallet')

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
        onConnect={() => connect({ connector: connector! })}
        onDisconnect={() => disconnect()}
        theme={darkTheme({})}
        wallets={wallets}
      />
    </div>
  )
}
