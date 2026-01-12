import { createConfig, fallback, webSocket } from 'wagmi'
import { Chain, hardhat, mainnet, sepolia } from 'wagmi/chains'

/**
 * To allow reuse in useContract() when building ethers provider from Wagmi Client.
 * @deprecated ethers to be removed in 1.0
 */
export function getRpcUrl(chainId: number, https: boolean = false): string {
  // to match allowed bigint
  chainId = Number(chainId)

  const proto = https ? 'wss' : 'ws'
  switch (chainId) {
    case 42161:
      return proto + '://arb-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY
    case 421614:
      return proto + '://arb-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY
    default:
      return proto + '://localhost:8545'
  }
}

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
  [mainnet.id]: fallback([
    webSocket('wss://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    webSocket(), // built-in default
  ]),
  [sepolia.id]: fallback([
    webSocket('wss://eth-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY),
    webSocket(),
  ]),
  [hardhat.id]: webSocket('http://localhost:8545'),
}

// E2E Testing Support: This is required to be here to automate provider in VITE env
const connectors = window.E2E
  ? [await import('@tests/e2e/wallet').then((m) => m.connector())]
  : []

export const config = createConfig({
  chains: chains as [Chain, ...Chain[]],
  transports,
  connectors,
})
