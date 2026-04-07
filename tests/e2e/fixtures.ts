import { createPublicClient, createWalletClient, http, padHex, stringToHex, parseEventLogs } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hardhat } from 'viem/chains'
import { ANVIL_ACCOUNTS } from '@wonderland/walletless'
import { marketAbi, offerAbi, dealAbi } from '@/wagmi'
import deployments from '@deployments/chain-31337/deployed_addresses.json' with { type: 'json' }

const MARKET_ADDRESS = deployments['Market#Market'] as `0x${string}`
const USDC_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`
const WETH_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as `0x${string}`
const PEXFI_TOKEN = deployments['Market#PexfiToken'] as `0x${string}`

export { marketAbi, offerAbi, dealAbi }

const transport = http('http://localhost:8545')
export const publicClient = createPublicClient({
  chain: hardhat,
  transport,
})

/**
 * Polls the subgraph until a given condition is met.
 * Useful for ensuring the subgraph has indexed the latest transactions.
 */
async function waitForSubgraph(query: string, check: (data: any) => boolean) {
  const url = 'http://localhost:8000/subgraphs/name/hardhat'
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const { data } = await response.json()
      if (check(data)) return
    } catch (e) {
      // Ignore errors (e.g. subgraph not ready yet)
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Subgraph timeout for query: ${query}`)
}

export type CreateOfferParams = {
  isSell?: boolean
  margin?: number | string
  limitMin?: number | string
  limitMax?: number | string
  token?: `0x${string}`
  fiat?: string
  methods?: bigint
  terms?: string
}

/**
 * Creates an offer using viem directly via JSON RPC.
 * Faster than using Playwright UI.
 *
 * @param params Offer parameters
 * @param accountIndex Index in ANVIL_ACCOUNTS (default 0)
 * @returns Offer address
 */
export async function createOffer(params: CreateOfferParams = {}, accountIndex = 0) {
  const account = privateKeyToAccount(ANVIL_ACCOUNTS[accountIndex].privateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport,
  })

  const p = {
    isSell: params.isSell ?? false,
    rate: Math.floor((1 + Number(params.margin || 2) / 100) * 10 ** 4),
    limits: {
      min: Number(params.limitMin || 100),
      max: Number(params.limitMax || 500),
    },
    token: params.token || USDC_ADDRESS,
    fiat: padHex(stringToHex(params.fiat || 'EUR'), { size: 3, dir: 'right' }),
    methods: params.methods || 1n,
    terms: params.terms || 'e2e terms',
  }

  const hash = await walletClient.writeContract({
    address: MARKET_ADDRESS,
    abi: marketAbi,
    functionName: 'createOffer',
    args: [p],
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  const logs = parseEventLogs({
    abi: marketAbi,
    eventName: 'OfferCreated',
    logs: receipt.logs,
  })

  if (logs.length === 0) throw new Error('OfferCreated event not found')

  const offerAddress = (logs[0].args as any).offer as `0x${string}`

  // Wait for subgraph to index the offer
  await waitForSubgraph(
    `{ offer(id: "${offerAddress.toLowerCase()}") { id } }`,
    (data) => !!data?.offer
  )

  return offerAddress
}

export type CreateDealParams = {
  fiatAmount: number | string
  paymentInstructions?: string
  method?: number
}

/**
 * Creates a deal for an existing offer.
 * Handles approval if necessary (e.g. for buy offers where taker sends tokens).
 *
 * @param offerAddress Address of the offer to create a deal from
 * @param params Deal parameters
 * @param accountIndex Index in ANVIL_ACCOUNTS (default 1)
 * @returns Deal address
 */
export async function createDeal(offerAddress: `0x${string}`, params: CreateDealParams, accountIndex = 1) {
  const account = privateKeyToAccount(ANVIL_ACCOUNTS[accountIndex].privateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport,
  })

  // 1. Get offer details to check if it's a Buy or Sell offer
  const isSell = await publicClient.readContract({
    address: offerAddress,
    abi: offerAbi,
    functionName: 'isSell',
  })

  // If it's a Buy offer (maker buys, taker sells), taker needs to approve Market to take tokens
  if (!isSell) {
    const tokenAddress = await publicClient.readContract({
      address: offerAddress,
      abi: offerAbi,
      functionName: 'token',
    })

    // Approve Market to spend tokens from taker (accountIndex)
    const approveHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: [
        {
          type: 'function',
          name: 'approve',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ type: 'bool' }],
          stateMutability: 'nonpayable',
        },
      ] as const,
      functionName: 'approve',
      args: [MARKET_ADDRESS, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
    })
    await publicClient.waitForTransactionReceipt({ hash: approveHash })
  }

  // 2. Create the deal
  const hash = await walletClient.writeContract({
    address: offerAddress,
    abi: offerAbi,
    functionName: 'createDeal',
    args: [
      {
        fiatAmount: BigInt(Math.floor(Number(params.fiatAmount) * 10 ** 6)),
        paymentInstructions: params.paymentInstructions || 'e2e instructions',
        method: params.method ?? 0,
      },
    ],
  })

  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  // The DealCreated event is emitted by the Market contract.
  const logs = parseEventLogs({
    abi: marketAbi,
    eventName: 'DealCreated',
    logs: receipt.logs,
  })

  if (logs.length === 0) throw new Error('DealCreated event not found')

  const dealAddress = (logs[0].args as any).deal as `0x${string}`

  // Wait for subgraph to index the deal
  await waitForSubgraph(
    `{ deal(id: "${dealAddress.toLowerCase()}") { id } }`,
    (data) => !!data?.deal
  )

  return dealAddress
}

