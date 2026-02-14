import * as dotenv from 'dotenv'
dotenv.config()

import hardhatToolboxMochaEthersPlugin from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import ignoreWarnings from 'hardhat-ignore-warnings';
import hardhatVerify from '@nomicfoundation/hardhat-verify';

import { defineConfig } from 'hardhat/config'

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, ignoreWarnings, hardhatVerify],
  paths: {
    sources: './evm/protocol',
    tests: './tests/evm',
    cache: './.cache/hardhat',
    artifacts: './.cache/artifacts',
    ignition: './evm',
  },
  typechain: {
    outDir: './evm/types',
  },
  networks: {
    hardhat: {
      type: 'edr-simulated',
    },
    localhost: {
      chainId: 31337,
      type: 'http',
      url: 'http://localhost:8545'
    },
    arbitrum: {
      type: 'http',
      url: process.env.ARBITRUM_URL ? process.env.ARBITRUM_URL : 'https://arb-mainnet.g.alchemy.com/v2/demo',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainType: 'op',
    },
    'arbitrum-sepolia': {
      type: 'http',
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainType: 'op',
    },
    sepolia: {
      chainId: 11155111,
      type: 'http',
      url: 'https://eth-sepolia.g.alchemy.com/v2/-pIVMYm22LgfrPb32FWlPaKWjXNmH2id',
      accounts: process.env.DEPLOYER_SEPOLIA ? [process.env.DEPLOYER_SEPOLIA] : [],
    },
  },

  // For contracts source verification
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_KEY || '',
    },
    blockscout: {
      enabled: true,
    },
  },

  solidity: {
    profiles: {
      default: {
        version: '0.8.26',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      production: {
        version: '0.8.26',
        settings: { optimizer: { enabled: true, runs: 1000 }, viaIR: true },
      },
    },
    npmFilesToBuild: [
      '@openzeppelin/contracts/token/ERC20/ERC20.sol',
      '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol',
    ],
  },
  warnings: {
    'evm/protocol/mocks/**/*': {
      default: 'off',
    },
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.GASREPORTER_COINMARKETCAP,
    L1: 'ethereum',
    L2: 'arbitrum',
    L2Etherscan: process.env.GASREPORTER_ETHERSCAN,
    excludeContracts: ['MockWBTC'],
  },
})
