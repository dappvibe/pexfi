import { renderHook } from '@testing-library/react'
import { useChainId } from 'wagmi'
import { useAddress } from './useAddress'
import addresses from '@deployments/chain-31337/deployed_addresses.json'

vi.mock('wagmi', () => ({
  useChainId: vi.fn(),
}))

describe('useAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the address for the current chain', () => {
    vi.mocked(useChainId).mockReturnValue(31337)

    const { result } = renderHook(() => useAddress('Market#Market'))

    expect(result.current).toBe(addresses['Market#Market'])
  })

  it('returns undefined and warns when chain addresses are missing', () => {
    vi.mocked(useChainId).mockReturnValue(12345)
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useAddress('Market#Market'))

    expect(result.current).toBeUndefined()
    expect(consoleWarnSpy).toHaveBeenCalledWith('No deployments found for chain 12345')
  })
})
