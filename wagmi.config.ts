import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'
import { readFileSync } from 'fs'
import { join } from 'path'
import { globSync } from 'glob'

const artifactNames = [
  'Market.json',
  'Deal.json',
  'Offer.json',
  'OfferFactory.json',
  'Profile.json',
  'PexfiToken.json',
  'PexfiVault.json',
  'PexfiVesting.json'
];

const loadContracts = () => {
  const contracts = [];
  const files = globSync('.cache/artifacts/**/*.json', { ignore: ['**/build-info/**', '**/*.dbg.json'] });
  for (const file of files) {
    const filename = file.split('/').pop();
    if (filename && artifactNames.includes(filename)) {
      const artifact = JSON.parse(readFileSync(file, 'utf8'));
      if (artifact.abi && artifact.abi.length > 0) {
        contracts.push({
          name: artifact.contractName || filename.replace('.json', ''),
          abi: artifact.abi,
        });
      }
    }
  }
  return contracts;
};

/**
 * This is CLI only wagmi config to generate hooks.
 * Browser config is in src/wagmi.config.ts
 */
export default defineConfig({
  out: 'src/wagmi/index.ts',
  contracts: [
    { name: 'erc20', abi: erc20Abi },
    ...loadContracts()
  ],
  plugins: [
    react(),
  ],
})
