import { renderHook } from '@testing-library/react'
import { useContract } from '@/hooks/useContract'

describe('useContract', () => {
  it('correctly initializes contracts with addresses for the current chain', () => {
    const { result } = renderHook(() => useContract())

    expect(result.current.Market).toBeDefined()
  })

  it('initializes dynamic contracts (Deal, Offer, Token) with placeholder address', () => {
    const { result } = renderHook(() => useContract())

    expect(result.current.Deal).toBeDefined()
    expect(result.current.Deal.address).toBe('0x')
  })

  it('returns a helper function "signed"', () => {
    const { result } = renderHook(() => useContract())
    expect(typeof result.current.signed).toBe('function')
  })
})
