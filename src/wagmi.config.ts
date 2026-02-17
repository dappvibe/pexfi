import { createConfig, fallback, http } from 'wagmi'
import { Chain, hardhat, mainnet, sepolia } from 'wagmi/chains'

const chains: Chain[] = []
switch (import.meta.env.MODE) {
  default:
    chains.push(hardhat)
  // fallthrough
  case 'staging':
    chains.push(sepolia)
  // fallthrough
  case 'production':
    chains.push(mainnet)
}

const transports = {
  [mainnet.id]: fallback([http('https://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY), http()]),
  [sepolia.id]: fallback([http('https://eth-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY), http()]),
  [hardhat.id]: http('http://localhost:8545'),
}

// E2E Testing Support: This is required to be here to automate provider in VITE env
const connectors = window.E2E
  ? [await import('@tests/e2e/wallet').then((m) => {
      m.install()
      return m.connector()
    })]
  : []

export const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  transports,
  connectors,
})
