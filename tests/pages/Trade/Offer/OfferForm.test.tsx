import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import OfferForm from '@/pages/Trade/Offer/OfferForm'
import { useInventory } from '@/hooks/useInventory'
import { useContract } from '@/hooks/useContract'

// Mock Hooks
vi.mock('@/hooks/useInventory', async () => {
    const actual = await import('@/../tests/mocks/useInventory')
    return { useInventory: actual.useInventory }
})

// Mock Ant Design Select
vi.mock('antd', async () => {
    const antd = await vi.importActual('antd')
    const Select = ({ children, onChange, value, ...props }: any) => {
        return (
            <select
                data-testid="mock-select"
                value={value || ''}
                onChange={e => onChange && onChange(e.target.value)}
                {...props}
            >
                {children}
            </select>
        )
    }
    Select.Option = ({ children, value }: any) => <option value={value}>{children}</option>
    return { ...antd, Select }
})

const mockCreate = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({ logs: [] }) })
const mockSetRate = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetLimits = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetTerms = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })
const mockSetDisabled = vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

// Mock Offer Contract Instance
const mockOfferContract = {
    setRate: mockSetRate,
    setLimits: mockSetLimits,
    setTerms: mockSetTerms,
    setDisabled: mockSetDisabled,
    connect: vi.fn().mockReturnThis()
}

// Mock useContract
vi.mock('@/hooks/useContract', () => {
    return {
        useContract: vi.fn(() => ({
            signed: vi.fn((contract) => Promise.resolve(contract)),
            OfferFactory: {
                create: mockCreate,
                connect: vi.fn().mockReturnThis()
            },
            Offer: {
                attach: vi.fn(() => mockOfferContract)
            },
            Market: {
                getPrice: vi.fn(() => Promise.resolve(50000000000n)), // 50000 * 10^6
                interface: {
                    parseLog: vi.fn()
                }
            }
        }))
    }
})

// Mock window.location.reload
Object.defineProperty(window, 'location', {
    configurable: true,
    value: { reload: vi.fn() },
})

describe('OfferForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('New Offer Mode', () => {
        it('renders all fields enabled and submits', async () => {
            render(
                <MemoryRouter>
                    <OfferForm />
                </MemoryRouter>
            )

            const selects = screen.getAllByTestId('mock-select')
            selects.forEach(select => expect(select.hasAttribute('disabled')).toBe(false))

            fireEvent.click(screen.getByText('Sell'))

            // 0: Token, 1: Fiat, 2: Method
            fireEvent.change(selects[0], { target: { value: 'USDT' } })
            fireEvent.change(selects[1], { target: { value: 'USD' } })
            fireEvent.change(selects[2], { target: { value: 'Bank Transfer' } })

            const rateInput = screen.getByLabelText('Margin')
            fireEvent.change(rateInput, { target: { value: '10' } })

            const minInput = screen.getByLabelText('Limits')
            fireEvent.change(minInput, { target: { value: '100' } })

            const maxInput = screen.getByLabelText('-')
            fireEvent.change(maxInput, { target: { value: '1000' } })

            const submitBtn = screen.getByText('Deploy contract')
            fireEvent.click(submitBtn)

            await waitFor(() => {
                expect(mockCreate).toHaveBeenCalled()
            })

            const expectedRate = 11000
            expect(mockCreate).toHaveBeenCalledWith(
                true,
                'USDT',
                'USD',
                'Bank Transfer',
                expectedRate,
                [100, 1000],
                ''
            )
        }, 30000)
    })

    describe('Edit Offer Mode', () => {
        const mockOffer = {
            address: '0xOfferAddress',
            isSell: true,
            token: 'WETH',
            fiat: 'EUR',
            method: 'Paypal',
            rate: 1.05,
            min: 500,
            max: 5000,
            terms: 'No refunds',
            disabled: false
        }

        it('renders with populated values and disabled core fields', () => {
            render(
                <MemoryRouter>
                    <OfferForm offer={mockOffer} />
                </MemoryRouter>
            )

            const selects = screen.getAllByTestId('mock-select')
            expect(selects[0].value).toBe('WETH')

            expect(screen.getByText('EUR')).not.toBeNull()
            expect(screen.getByDisplayValue('5.00')).not.toBeNull()
            expect(screen.getByDisplayValue('500')).not.toBeNull()
            expect(screen.getByDisplayValue('5000')).not.toBeNull()
            expect(screen.getByDisplayValue('No refunds')).not.toBeNull()

            expect(screen.queryByText('Deploy contract')).toBeNull()

            expect(selects[0].hasAttribute('disabled')).toBe(true)
        })

        it('updates Rate', async () => {
            render(
                <MemoryRouter>
                    <OfferForm offer={mockOffer} />
                </MemoryRouter>
            )

            const rateInput = screen.getByLabelText('Margin')
            fireEvent.change(rateInput, { target: { value: '10' } })

            const updateBtn = screen.getAllByText('Update')[0]
            fireEvent.click(updateBtn)

            await waitFor(() => {
                expect(mockSetRate).toHaveBeenCalledWith(11000)
            })
        })

        it('updates Limits', async () => {
            render(
                <MemoryRouter>
                    <OfferForm offer={mockOffer} />
                </MemoryRouter>
            )

            const minInput = screen.getByLabelText('Limits')
            fireEvent.change(minInput, { target: { value: '200' } })

            const updateBtn = screen.getAllByText('Update')[1]
            fireEvent.click(updateBtn)

            await waitFor(() => {
                expect(mockSetLimits).toHaveBeenCalledWith([200, 5000])
            })
        })

        it('updates Terms', async () => {
             render(
                <MemoryRouter>
                    <OfferForm offer={mockOffer} />
                </MemoryRouter>
            )

            const termsInput = screen.getByLabelText('Terms')
            fireEvent.change(termsInput, { target: { value: 'New terms' } })

            const updateBtn = screen.getAllByText('Update')[2]
            fireEvent.click(updateBtn)

            await waitFor(() => {
                expect(mockSetTerms).toHaveBeenCalledWith('New terms')
            })
        })

        it('toggles Disable', async () => {
             render(
                <MemoryRouter>
                    <OfferForm offer={mockOffer} />
                </MemoryRouter>
            )

            const disableBtn = screen.getByText('Disable')
            fireEvent.click(disableBtn)

            await waitFor(() => {
                expect(mockSetDisabled).toHaveBeenCalledWith(true)
            })
        })
    })
})
