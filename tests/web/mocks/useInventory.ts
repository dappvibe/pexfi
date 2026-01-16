import { vi } from 'vitest'

export const mockInventory = {
  tokens: {
    '0xTokenAddress': {
      address: '0xTokenAddress',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    '0xWETHAddress': {
        address: '0xWETHAddress',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
      },
  },
  fiats: ['USD', 'EUR', 'GBP'],
  methods: {
    'Bank Transfer': { name: 'Bank Transfer', group: 1 },
    'Paypal': { name: 'Paypal', group: 2 },
  },
}

export const useInventory = vi.fn(() => mockInventory)
