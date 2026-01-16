/**
 * Setup [walletless](https://github.com/defi-wonderland/walletless) provider for E2E testing.
 *
 * It provides native connector for Wagmi and automatically signs transactions.
 * Control functions must be injected to page's 'window' which is available in tests.
 *
 * This file is imported by wagmi.config.ts when E2E mode is enabled.
 */
import { createE2EProvider, e2eConnector, setChain as _setChain, setSigningAccount, ANVIL_ACCOUNTS } from '@wonderland/walletless'
import { hardhat } from 'wagmi/chains'

export const provider = createE2EProvider({
  chains: [hardhat],
  rpcUrls: {
    31337: 'http://localhost:8545'
  },
})

export const connector = () => e2eConnector({
  provider: provider,
  account: ANVIL_ACCOUNTS[0].privateKey,
  debug: true,
})

declare global {
  interface Window {
    E2E: boolean
    provider: typeof provider
    setAccount: (id: number) => void
    setChain: (id: number) => void
  }
}
export const install = () => {
  window.provider = provider
  window.setAccount = (id: number) => {
    return setSigningAccount(provider, id)
  }
  window.setChain = (id: number) => {
    return _setChain(provider, id)
  }
}
