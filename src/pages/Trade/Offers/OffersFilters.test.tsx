import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import OffersFilters from '@/pages/Trade/Offers/OffersFilters'

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
    Paypal: { name: 'Paypal', group: 2 },
  },
}
vi.mock('@/hooks/useInventory', async () => {
  return {
    useInventory: vi.fn(() => mockInventory),
  }
})

// Mock useNavigate and useParams
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn(() => ({
      side: 'sell',
      token: 'WETH', // Matches URL param expectation
      fiat: 'USD',
      method: 'Bank Transfer',
    })),
  }
})

describe('OffersFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders filter inputs', () => {
    render(
      <MemoryRouter>
        <OffersFilters setFilterAmount={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('Amount')).not.toBeNull()
    // Ant Design Selects are complex. We can find them by role `combobox` or placeholder/default value text if rendered.
    // "Search to Select" (Fiat) and "Payment method" (Method)
    expect(screen.getByText('USD')).not.toBeNull() // Default mocked fiat
    expect(screen.getByText('Bank Transfer')).not.toBeNull() // Default mocked method
  })

  it('triggers setFilterAmount on amount change', () => {
    const setFilterAmount = vi.fn()
    render(
      <MemoryRouter>
        <OffersFilters setFilterAmount={setFilterAmount} />
      </MemoryRouter>
    )

    const input = screen.getByPlaceholderText('Amount')
    fireEvent.change(input, { target: { value: '100' } })
    expect(setFilterAmount).toHaveBeenCalledWith('100')
  })

  it('navigates on fiat change', async () => {
    render(
      <MemoryRouter>
        <OffersFilters setFilterAmount={vi.fn()} />
      </MemoryRouter>
    )

    // Find the Fiat Select. It has default value 'USD'.
    // Ant Design Select structure: .ant-select-selector containing the value.
    // We can find the container by the text 'USD' that is NOT the option in the list.
    const fiatSelector = screen.getByText('USD')
    fireEvent.mouseDown(fiatSelector)

    // Wait for dropdown? It usually renders synchronously in tests but might be in a portal.
    // Option 'EUR' should appear.
    // Use getAllByText in case multiple (hidden/visible) and pick the last one (usually the dropdown one)
    // or just pick the one with class 'ant-select-item-option-content'
    const euroOptions = screen.getAllByText('EUR')
    const euroOption = euroOptions[euroOptions.length - 1]
    fireEvent.click(euroOption)

    expect(mockNavigate).toHaveBeenCalledWith('/trade/sell/WETH/EUR/Bank%20Transfer')
  })

  it('navigates on method change', async () => {
    render(
      <MemoryRouter>
        <OffersFilters setFilterAmount={vi.fn()} />
      </MemoryRouter>
    )

    // Method Select default 'Bank Transfer'.
    // We need to distinguish it from the one in the list if the list is mounted.
    // But initially list shouldn't be open.
    // However, 'Bank Transfer' might be text in the mocked inventory displayed elsewhere? No.

    // Let's target the one that is likely the select value.
    const methodSelects = screen.getAllByText('Bank Transfer')
    const methodSelector = methodSelects[0] // Usually the value in the box
    fireEvent.mouseDown(methodSelector)

    // Select 'Paypal'
    const paypalOptions = screen.getAllByText('Paypal')
    const paypalOption = paypalOptions[paypalOptions.length - 1]
    fireEvent.click(paypalOption)

    expect(mockNavigate).toHaveBeenCalledWith('/trade/sell/WETH/USD/Paypal')
  })
})
