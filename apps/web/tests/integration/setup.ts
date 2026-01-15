import { JsonRpcProvider, Wallet, Contract, Signer } from 'ethers'
import fs from 'fs'
import path from 'path'

export const chainId = 31337

// Default Hardhat Private Keys
const ALICE_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const BOB_PK = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

const network = {
  name: 'localhost',
  chainId: 31337,
  ensAddress: null,
}
export const provider = new JsonRpcProvider('http://127.0.0.1:8545', network, { staticNetwork: true })

// Wallets
export const alice = new Wallet(ALICE_PK, provider)
export const bob = new Wallet(BOB_PK, provider)

// Load Artifacts via FS to avoid mocking or resolve issues
const loadAbi = (name: string) => {
  const p = path.resolve(__dirname, `../../contracts/artifacts/${name}.json`)
  return JSON.parse(fs.readFileSync(p, 'utf-8')).abi
}

// Load Addresses
const addressesPath = path.resolve(__dirname, '../../contracts/addresses.json')
const deployedData = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'))
export const addresses = deployedData[chainId] || deployedData['31337']

if (!addresses) {
  console.warn('No addresses found for chain 31337.')
}

export const ABIs = {
  Market: loadAbi('Market'),
  OfferFactory: loadAbi('OfferFactory'),
  Offer: loadAbi('Offer'),
  DealFactory: loadAbi('DealFactory'),
  Deal: loadAbi('Deal'),
  Token: loadAbi('ERC20'),
}

// Helper to get contract instances connected to a signer
export const getContracts = (signer: Signer) => {
  return {
    Market: new Contract(addresses['Market#Market'], ABIs.Market, signer),
    OfferFactory: new Contract(addresses['OfferFactory#OfferFactory'], ABIs.OfferFactory, signer),
    DealFactory: new Contract(addresses['DealFactory#DealFactory'], ABIs.DealFactory, signer),
    TOKEN: new Contract(addresses['RepToken#RepToken'], ABIs.Token, signer), // Main Payment Token

    // Dynamic Helpers
    getOffer: (address: string) => new Contract(address, ABIs.Offer, signer),
    getDeal: (address: string) => new Contract(address, ABIs.Deal, signer),
    getToken: (address: string) => new Contract(address, ABIs.Token, signer),
  }
}
