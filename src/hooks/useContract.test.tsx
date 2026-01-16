import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useContract } from '@/hooks/useContract'
import { ethers } from 'ethers'

// Mock Wagmi
const mockClient = {
  chain: { id: 31337, name: 'Localhost' },
  transport: {},
  account: { address: '0xAlice' },
}

vi.mock('wagmi', async () => ({
  useChainId: () => 31337,
  useClient: () => mockClient,
  useConnectorClient: () => ({ data: mockClient }),
}))

// Mock Ethers
vi.mock('ethers', async (importOriginal) => {
  const original = await importOriginal<typeof import('ethers')>()

  // Must be a function, not arrow function, to work with 'new'
  const MockContract = vi.fn(function () {
    return {
      connect: vi.fn().mockReturnThis(),
      target: '0xContract',
    }
  })

  return {
    ...original,
    // Mock the named export 'Contract'
    Contract: MockContract,
    // Mock the 'ethers' default/namespace export used in the file
    ethers: {
      ...original.ethers,
      Contract: MockContract,
      // provider mocks
      WebSocketProvider: vi.fn(),
      BrowserProvider: vi.fn(),
      JsonRpcSigner: vi.fn(),
    },
    // Mock other top-level exports used
    WebSocketProvider: vi.fn(),
    BrowserProvider: vi.fn(),
    JsonRpcSigner: vi.fn(),
  }
})

describe('useContract', () => {
  it('initializes all contracts correctly', () => {
    const { result } = renderHook(() => useContract())

    expect(result.current.Market).toBeDefined()
    expect(result.current.OfferFactory).toBeDefined()
    expect(result.current.DealFactory).toBeDefined()
    expect(result.current.RepToken).toBeDefined()
    expect(result.current.Deal).toBeDefined()

    // precise checks
    // We mocked ethers.Contract, so check that spy
    expect(ethers.Contract).toHaveBeenCalledWith(
      expect.stringMatching(/^0x/), // address
      expect.anything(), // abi
      expect.anything() // provider
    )
  })

  it('signed function returns connected contract', async () => {
    const { result } = renderHook(() => useContract())
    const mockContract = { connect: vi.fn().mockReturnThis() }

    const signedContract = await result.current.signed(mockContract as any)

    expect(mockContract.connect).toHaveBeenCalled()
    expect(signedContract).toBe(mockContract)
  })
})
