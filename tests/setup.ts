import { vi } from 'vitest'

// 1. Mock Wagmi (Viem integration)
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    // Use vi.fn() so tests can override implementation via .mockReturnValue if needed
    useChainId: vi.fn(() => 31337),
    useClient: vi.fn(() => ({
      chain: { id: 31337, name: 'Hardhat' },
      transport: { type: 'http' },
      request: vi.fn(),
    })),
    useConnectorClient: vi.fn(() => ({ data: null })),
    useAccount: vi.fn(() => ({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Standard Hardhat Account #0
      isConnected: true,
    })),
  }
})

// 2. Mock Ethers
vi.mock('ethers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ethers')>()
  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      // Use a standard function so it can be called with 'new'
      Contract: vi.fn().mockImplementation(function (address, abi, provider) {
        return {
          address,
          interface: { format: () => [] },
          connect: vi.fn(),
          // Add common methods to prevent "undefined is not a function" errors
          on: vi.fn(),
          off: vi.fn(),
          queryFilter: vi.fn(() => []),
        }
      }),
      JsonRpcProvider: vi.fn(),
      BrowserProvider: vi.fn(),
      JsonRpcSigner: vi.fn(),
    },
  }
})

// 3. Mock Project Config (Adjust path as necessary relative to this file)
vi.mock('../src/wagmi.config', () => ({
  getRpcUrl: vi.fn(() => 'http://localhost:8545'),
}))

// 4. Mock Contract Addresses (Matches test expectations)
vi.mock('../contracts/addresses.json', () => ({
  default: {
    31337: {
      'Market#Market': '0xMarketAddress',
      'RepToken#RepToken': '0xRepTokenAddress',
    },
  },
}))
