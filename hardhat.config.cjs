require('@nomicfoundation/hardhat-ignition-ethers')
require('@nomicfoundation/hardhat-chai-matchers')
require('@nomicfoundation/hardhat-ethers')
require('@nomicfoundation/hardhat-network-helpers')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-ignore-warnings')
require('hardhat-contract-sizer')
require('hardhat-dependency-compiler')
require('@nomicfoundation/hardhat-verify')
require('hardhat-gas-reporter')
require('solidity-docgen')

require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  paths: {
    sources: './evm/protocol',
    tests: './tests/evm',
    cache: './.cache/hardhat',
    artifacts: './evm/artifacts',
    ignition: './evm/ignition',
  },
  networks: {
    arbitrum: {
      url: process.env.ARBITRUM_URL ? process.env.ARBITRUM_URL : 'https://arb-mainnet.g.alchemy.com/v2/demo',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : 'remote',
    },
    'arbitrum-sepolia': {
      url: 'https://sepolia-rollup.arbitrum.io/rpc',
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : 'remote',
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/-pIVMYm22LgfrPb32FWlPaKWjXNmH2id',
      accounts: [process.env.DEPLOYER_SEPOLIA],
    },
  },

  // For contracts source verification on local blockscout
  etherscan: {
    apiKey: {
      // Is not required by blockscout. Can be any non-empty string
      localhost: 'abc',
      sepolia: process.env.ETHERSCAN_KEY,
    },
    customChains: [
      {
        network: 'localhost',
        chainId: 31337,
        urls: {
          apiURL: 'http://localhost/api',
          browserURL: 'http://localhost/',
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },

  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  dependencyCompiler: {
    paths: ['@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol'],
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
  defender: {
    useDefenderDeploy: true,
    apiKey: process.env.DEFENDER_API_KEY,
    apiSecret: process.env.DEFENDER_API_SECRET,
  },
  docgen: {
    pages: 'items',
  },
}
