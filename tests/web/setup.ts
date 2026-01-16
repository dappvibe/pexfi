// 1. Mock Wagmi (Viem integration)
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    // Mock Provider to just render children, bypassing config validation
    WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
    // Hooks
    useChainId: vi.fn(() => 31337),
    useConfig: vi.fn(() => ({
      chains: [{ id: 31337, name: 'Hardhat' }],
    })),
    useClient: vi.fn(() => ({
      chain: { id: 31337, name: 'Hardhat' },
      transport: { type: 'http' },
      request: vi.fn(),
    })),
    useConnectorClient: vi.fn(() => ({ data: null })),
    useAccount: vi.fn(() => ({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Standard Hardhat Account #0
      isConnected: true,
      chain: { id: 31337 },
    })),
    useConnections: vi.fn(() => []),
    useConnect: vi.fn(() => ({ connect: vi.fn() })),
    useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
    useSwitchChain: vi.fn(() => ({
      switchChain: vi.fn(),
      chains: [{ id: 31337, name: 'Hardhat' }],
    })),
    useChains: vi.fn(() => [{ id: 31337, name: 'Hardhat' }]),
    useBalance: vi.fn(() => ({ data: { formatted: '1.0', symbol: 'ETH' } })),
    useEnsName: vi.fn(() => ({ data: null })),
    useWaitForTransactionReceipt: vi.fn(() => ({ isLoading: false, isSuccess: true })),
    useWriteContract: vi.fn(() => ({ writeContract: vi.fn(), isPending: false })),
    useReadContract: vi.fn(() => ({ data: null })),
    useSimulateContract: vi.fn(() => ({ data: null })),
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
vi.mock('@/wagmi.config', () => ({
  getRpcUrl: vi.fn(() => 'http://localhost:8545'),
  config: {
    chains: [{ id: 31337, name: 'Hardhat' }],
    connectors: [],
    transports: { 31337: { type: 'http' } },
    _internal: { mipd: undefined },
    // Add other necessary config properties if Wagmi complains
    // Or try to utilize real createConfig if possible, but mocking is safer for now to avoid side effects
  },
}))

// 4. Mock Contract Addresses (removed as now using dynamic import)
// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Mock matchMedia for Ant Design (Responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
