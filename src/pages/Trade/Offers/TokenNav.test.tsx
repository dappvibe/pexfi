import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TokenNav from '@/pages/Trade/Offers/TokenNav'
import { useInventory } from '@/hooks/useInventory'

// Mock useInventory
// Mock useInventory
const mockInventory = {
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
vi.mock('@/hooks/useInventory', () => ({
    useInventory: vi.fn(() => mockInventory)
}))

// Mock useParams
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useParams: vi.fn(() => ({
            side: 'sell',
            token: '0xTokenAddress', // Matches mocked inventory key
            fiat: 'USD',
            method: 'Bank Transfer'
        }))
    }
})

describe('TokenNav', () => {
    it('renders menu items for inventory tokens', () => {
        render(
            <MemoryRouter>
                <TokenNav />
            </MemoryRouter>
        )
        // Mocks have USDT and WETH
        expect(screen.getByText('USDT')).not.toBeNull()
        expect(screen.getByText('WETH')).not.toBeNull()
    })

    it('highlights the active token', () => {
        render(
            <MemoryRouter>
                <TokenNav />
            </MemoryRouter>
        )
        // Antd Menu selected item

        // Find the link for USDT (0xTokenAddress)
        const usdtLink = screen.getByText('USDT')
        const menuItem = usdtLink.closest('li')
        expect(menuItem?.classList.contains('ant-menu-item-selected')).toBe(true)

        // WETH should not be selected
        const wethLink = screen.getByText('WETH')
        const wethItem = wethLink.closest('li')
        expect(wethItem?.classList.contains('ant-menu-item-selected')).toBe(false)
    })

    it('generates correct navigation links', () => {
        render(
            <MemoryRouter>
                <TokenNav />
            </MemoryRouter>
        )

        // Keys in mockInventory are '0xWETHAddress', '0xTokenAddress'
        // generatePath uses these keys as the :token param

        const wethLink = screen.getByText('WETH').closest('a')
        expect(wethLink?.getAttribute('href')).toBe('/trade/sell/0xWETHAddress/USD/Bank%20Transfer')

        const usdtLink = screen.getByText('USDT').closest('a')
        expect(usdtLink?.getAttribute('href')).toBe('/trade/sell/0xTokenAddress/USD/Bank%20Transfer')
    })
})
