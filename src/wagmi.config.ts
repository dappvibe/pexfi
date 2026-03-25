import { createConfig, fallback, http, webSocket } from 'wagmi'
import { Chain, hardhat, mainnet, sepolia } from 'wagmi/chains'
import { createThirdwebClient } from 'thirdweb'
import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter'

const chains: Chain[] = []
switch (import.meta.env.MODE) {
  default:
    chains.push(hardhat)
  // fallthrough
  case 'production':
    chains.push(sepolia)
    chains.push(mainnet)
}

const transports = {
  [mainnet.id]: fallback([
    webSocket('wss://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    http()
  ]),
  [sepolia.id]: fallback([
    webSocket('wss://eth-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    http()
  ]),
  [hardhat.id]: http('http://127.0.0.1:8545'),
}

export const thirdwebClient = createThirdwebClient({ clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID })

// E2E Testing Support: This is required to be here to automate provider in VITE env
// We explicitly bypass 'typeof window' check in the static analysis so Vite does not tree-shake the E2E mock chunk in production builds
const _isE2E = () => { try { return typeof window !== 'undefined' && ((window as any).webdriver || window.navigator?.webdriver) } catch(e) { return false } }

const connectors = _isE2E()
  ? [
      await import('@tests/e2e/wallet').then((m) => {
        m.install()
        return m.connector()
      }),
    ]
  : [
      inAppWalletConnector({
        client: thirdwebClient,
      }),
    ]

export const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  transports,
  connectors,
})
