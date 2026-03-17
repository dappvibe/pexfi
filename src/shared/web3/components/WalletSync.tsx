import { useEffect } from 'react'
import { useActiveAccount, useAutoConnect, useIsAutoConnecting } from 'thirdweb/react'
import { createWallet } from 'thirdweb/wallets'
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi'
import { thirdwebClient } from '@/wagmi.config'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.brave.wallet'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
]

export default function WalletSync() {
  const thirdwebAccount = useActiveAccount()
  const isThirdwebAutoConnecting = useIsAutoConnecting()
  const { isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()

  // Auto connect thirdweb on page reload
  useAutoConnect({
    client: thirdwebClient,
    wallets,
  })

  useEffect(() => {
    // If thirdweb has an active account but wagmi is not connected/connecting
    if (thirdwebAccount && !isConnected && !isConnecting && !isReconnecting) {
      const connector = connectors.find((c) => c.id === 'in-app-wallet' || c.type === 'inAppWallet')
      if (connector) {
        connect({ connector })
      }
    }
    // If thirdweb has no active account and is done auto-connecting, but wagmi is connected
    else if (!thirdwebAccount && !isThirdwebAutoConnecting && isConnected) {
      disconnect()
    }
  }, [thirdwebAccount, isThirdwebAutoConnecting, isConnected, isConnecting, isReconnecting, connect, disconnect, connectors])

  return null
}
