const {readFileSync} = require("node:fs");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-ignore-warnings');
require("hardhat-tracer");
require("hardhat-contract-sizer");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "sepolia",
    networks: {
        sepolia: {
            url: "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: [
                readFileSync('./test/wallet/deployer.key').toString().trim(),
                readFileSync('./test/wallet/seller.key').toString().trim(),
                readFileSync('./test/wallet/buyer.key').toString().trim(),
                readFileSync('./test/wallet/mediator.key').toString().trim(),
            ],
        },
    },
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            viaIR: true
        }
    },
    warnings: {
        'src/mocks/**/*': {
            default: 'off',
        },
    },
    gasReporter: {
        enabled: false,
    }
};
