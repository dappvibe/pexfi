import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { DealState, useDeal } from '@/wagmi/contracts/useDeal'

const mockUseReadContracts = vi.fn()
const mockUseReadContract = vi.fn()
const mockUseWatchContractEvent = vi.fn()

vi.mock('wagmi', () => ({
  useChainId: vi.fn(() => 1),
  usePublicClient: () => ({
    getLogs: vi.fn().mockResolvedValue([]),
    getBlock: vi.fn(),
  }),
  useReadContracts: (config: any) => mockUseReadContracts(config),
  useReadContract: (config: any) => mockUseReadContract(config),
  useWatchContractEvent: (config: any) => mockUseWatchContractEvent(config),
}))

vi.mock('@/hooks/useInventory', () => ({
  useInventory: vi.fn(() => ({
    tokens: {
      ETH: { decimals: 18, api: '0xToken', name: 'Ethereum', symbol: 'ETH', id: 1 },
    },
    fiats: ['USD'],
    methods: {},
  })),
}))

const mockContractData = [
  { status: 'success', result: 0 }, // state
  { status: 'success', result: '0xOfferAddress' }, // offer
  { status: 'success', result: '0xTakerAddress' }, // taker
  { status: 'success', result: 1000000000000000000n }, // tokenAmount
  { status: 'success', result: 100000000n }, // fiatAmount
  { status: 'success', result: 'deal terms' }, // terms
  { status: 'success', result: 'pay here' }, // paymentInstructions
  { status: 'success', result: 1704067200n }, // allowCancelUnacceptedAfter
  { status: 'success', result: 1704153600n }, // allowCancelUnpaidAfter
  { status: 'success', result: [false, false, ''] }, // feedbackForOwner
  { status: 'success', result: [false, false, ''] }, // feedbackForTaker
]

describe('useDeal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null deal when no address provided', async () => {
    mockUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseReadContract.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useDeal(undefined))

    await waitFor(() => {
      expect(result.current.deal).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('returns deal data with formatted amounts', async () => {
    mockUseReadContracts.mockReturnValue({
      data: mockContractData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseReadContract.mockReturnValue({ data: 'ETH' })

    const { result } = renderHook(() => useDeal('0x123' as `0x${string}`))

    await waitFor(() => {
      expect(result.current.deal).not.toBeNull()
      expect(result.current.deal?.state).toBe(DealState.Created)
      expect(result.current.deal?.tokenAmountFormatted).toBe('1')
      expect(result.current.deal?.fiatAmountFormatted).toBe('100')
      expect(result.current.deal?.terms).toBe('deal terms')
      expect(result.current.deal?.paymentInstructions).toBe('pay here')
    })
  })

  it('handles loading state', async () => {
    mockUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })
    mockUseReadContract.mockReturnValue({ data: undefined })

    const { result } = renderHook(() => useDeal('0x123' as `0x${string}`))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
      expect(result.current.deal).toBeNull()
    })
  })

  it('calculates isFinal correctly for cancelled deals', async () => {
    const cancelledData = [...mockContractData]
    cancelledData[0] = { status: 'success', result: DealState.Cancelled }

    mockUseReadContracts.mockReturnValue({
      data: cancelledData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseReadContract.mockReturnValue({ data: 'ETH' })

    const { result } = renderHook(() => useDeal('0x123' as `0x${string}`))

    await waitFor(() => {
      expect(result.current.deal?.isFinal).toBe(true)
    })
  })
})
