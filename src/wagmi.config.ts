import { createConfig, fallback, http, webSocket } from 'wagmi'
import { Chain, hardhat, mainnet, sepolia } from 'wagmi/chains'
import Onboard from '@web3-onboard/core'
import wagmi from '@web3-onboard/wagmi'
import injectedModule from '@web3-onboard/injected-wallets'

// E2E Testing Support: This is required to be here to automate provider in VITE env
// We explicitly bypass 'typeof window' check in the static analysis so Vite does not tree-shake the E2E mock chunk in production builds
const _isE2E = () => { try { return typeof window !== 'undefined' && ((window as any).webdriver || window.navigator?.webdriver) } catch(e) { return false } }

const chains: Chain[] = []
switch (import.meta.env.MODE) {
  default:
    chains.push(hardhat)
  // fallthrough
  case 'production':
    if (!_isE2E()) {
      chains.push(sepolia)
      chains.push(mainnet)
    } else if (chains.length === 0) {
      chains.push(hardhat)
    }
}

const transports: Record<number, any> = {
  [hardhat.id]: webSocket('ws://127.0.0.1:8545'),
}

if (!_isE2E()) {
  transports[mainnet.id] = fallback([
    webSocket('wss://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    http()
  ])
  transports[sepolia.id] = fallback([
    webSocket('wss://eth-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    http()
  ])
}

const e2eConnectors = _isE2E()
  ? [
      await import('@tests/e2e/wallet').then((m) => {
        m.install()
        return m.connector()
      }),
    ]
  : []

export const web3Onboard = Onboard({
  wagmi,
  wallets: [injectedModule()],
  chains: chains.map((chain) => ({
    id: `0x${chain.id.toString(16)}`,
    token: chain.nativeCurrency.symbol,
    label: chain.name,
    rpcUrl: chain.rpcUrls.default.http[0],
  })),
  appMetadata: {
    name: 'PEXFI P2P',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><circle cx="200" cy="200" r="200" fill="#000"/></svg>',
    description: 'onchain P2P marketplace',
  },
})

const state = web3Onboard.state.get()

export const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  transports,
  connectors: _isE2E() ? e2eConnectors : (state.wagmiConfig?.connectors || []),
})
