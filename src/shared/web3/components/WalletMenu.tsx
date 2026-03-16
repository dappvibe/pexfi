import { ConnectButton, darkTheme } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ConnectButton
        client={thirdwebClient}
        appMetadata={{
          name: 'PEXFI P2P',
          url: 'https://pexfi.com',
          description: 'onchain P2P marketplace',
        }}
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
        }}
        theme={darkTheme({})}
        wallets={wallets}
      />
    </div>
  )
}
