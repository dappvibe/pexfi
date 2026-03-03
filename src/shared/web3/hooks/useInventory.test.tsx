import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { useInventory } from './useInventory'
import { MockedProvider } from '@apollo/client/testing/react'
import { gql } from '@apollo/client'
import { describe, it, expect } from 'vitest'

const GET_INVENTORY = gql`
  query GetInventory {
    tokens(where: { removed: false }) {
      id
      address
      name
      symbol
      decimals
    }
    fiats(where: { removed: false }) {
      id
      symbol
    }
    methods(where: { disabled: false }) {
      id
      name
      index
    }
  }
`

const inventoryMock = {
  request: {
    query: GET_INVENTORY,
  },
  result: {
    data: {
      tokens: [
        {
          __typename: 'Token',
          id: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
          address: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
          name: 'MockUSDC',
          symbol: 'USDC',
          decimals: 6,
        },
        {
          __typename: 'Token',
          id: '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
          address: '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
          name: 'MockWETH',
          symbol: 'WETH',
          decimals: 18,
        },
      ],
      fiats: [
        {
          __typename: 'Fiat',
          id: '0x4555520000000000000000000000000000000000000000000000000000000000',
          symbol: 'EUR',
        },
        {
          __typename: 'Fiat',
          id: '0x5553440000000000000000000000000000000000000000000000000000000000',
          symbol: 'USD',
        },
      ],
      methods: [
        {
          __typename: 'Method',
          id: '0',
          name: 'Bank Transfer',
          index: '0',
        },
      ],
    },
  },
}

describe('useInventory', () => {
  it('fetches and transforms inventory data correctly from subgraph', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={[inventoryMock]} addTypename={true}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useInventory(), { wrapper })

    // Wait for data to be loaded
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Validation
    const { tokens, fiats, methods } = result.current

    // Check Tokens
    expect(tokens['USDC']).toBeDefined()
    expect(tokens['USDC'].symbol).toBe('USDC')
    expect(tokens['USDC'].decimals).toBe(6)

    expect(tokens['WETH']).toBeDefined()
    expect(tokens['WETH'].decimals).toBe(18)

    // Check Fiats
    expect(fiats['USD']).toBeDefined()
    expect(fiats['EUR']).toBeDefined()
    expect(fiats['USD'].id).toBe('0x5553440000000000000000000000000000000000000000000000000000000000')

    // Check Methods
    expect(methods['Bank Transfer']).toBeDefined()
    expect(methods['Bank Transfer'].index).toBe('0')
  })

  it('handles empty data gracefully', async () => {
    const emptyMock = {
      request: {
        query: GET_INVENTORY,
      },
      result: {
        data: {
          tokens: [],
          fiats: [],
          methods: [],
        },
      },
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={[emptyMock]} addTypename={true}>
        {children}
      </MockedProvider>
    )

    const { result } = renderHook(() => useInventory(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tokens).toEqual({})
    expect(result.current.fiats).toEqual({})
    expect(result.current.methods).toEqual({})
  })
})
