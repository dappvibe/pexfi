import { defineConfig } from '@wagmi/cli'
import { react, hardhat } from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'

/**
 * This is CLI only wagmi config to generate hooks.
 * Browser config is in src/wagmi.config.ts
 */
export default defineConfig({
  out: 'src/wagmi/index.ts',
  contracts: [{ name: 'erc20', abi: erc20Abi }],
  plugins: [
    react(),
    hardhat({
      project: '.',
      artifacts: '.cache/artifacts',
      include: ['Market.json', 'Deal.json', 'DealFactory.json', 'Offer.json', 'OfferFactory.json', 'Profile.json', 'PexfiToken.json'],
    }),
  ],
})
