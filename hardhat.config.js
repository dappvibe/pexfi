require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-ignore-warnings');
require("hardhat-tracer");
require("hardhat-contract-sizer");
require('hardhat-dependency-compiler');
require("@nomicfoundation/hardhat-verify");
require('solidity-docgen');

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        "arbitrum-sepolia": {
            url: "https://sepolia-rollup.arbitrum.io/rpc",
        },
    },

    // For contracts source verification on local blockscout
    etherscan: {
        apiKey: {
            // Is not required by blockscout. Can be any non-empty string
            localhost: "abc"
        },
        customChains: [
            {
                network: "localhost",
                chainId: 31337,
                urls: {
                    apiURL: "http://localhost/api",
                    browserURL: "http://localhost/",
                }
            }
        ]
    },
    sourcify: {
        enabled: false
    },

    solidity: {
        version: "0.8.26",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            viaIR: true
        }
    },
    dependencyCompiler: {
        paths: [
            '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol',
        ],
    },
    warnings: {
        'contracts/mocks/**/*': {
            default: 'off',
        },
    },
    gasReporter: {
        enabled: true,
        coinmarketcap: process.env.GASREPORTER_COINMARKETCAP,
        L1: "ethereum",
        L2: "arbitrum",
        L2Etherscan: process.env.GASREPORTER_ETHERSCAN,
        excludeContracts: ["MockWBTC"]
    },
    defender: {
        useDefenderDeploy: true,
        apiKey: process.env.DEFENDER_API_KEY,
        apiSecret: process.env.DEFENDER_API_SECRET,
    },
    docgen: {
        pages: 'items'
    }
};
