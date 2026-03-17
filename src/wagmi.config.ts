import { createConfig, fallback, http, webSocket } from 'wagmi'
import { Chain, hardhat, mainnet, sepolia } from 'wagmi/chains'
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
  [hardhat.id]: webSocket('ws://127.0.0.1:8545'),
}

// E2E Testing Support: This is required to be here to automate provider in VITE env
// We explicitly bypass 'typeof window' check in the static analysis so Vite does not tree-shake the E2E mock chunk in production builds
const _isE2E = () => { try { return typeof window !== 'undefined' && ((window as any).webdriver || window.navigator?.webdriver) } catch(e) { return false } }

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, rainbowWallet, coinbaseWallet, braveWallet, rabbyWallet, zerionWallet } from '@rainbow-me/rainbowkit/wallets'

const defaultConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, braveWallet, rabbyWallet, zerionWallet],
    },
  ],
  {
    appName: 'PEXFI P2P',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default_project_id',
  }
)

const connectors = _isE2E()
  ? [
      await import('@tests/e2e/wallet').then((m) => {
        m.install()
        return m.connector()
      }),
    ]
  : defaultConnectors

export const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  transports,
  connectors,
})
