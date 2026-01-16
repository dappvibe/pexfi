import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Offers from '@/pages/Trade/Offers/Offers'
import { useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { useOffers } from '@/hooks/useOffers'
import { useParams } from 'react-router-dom'
import { useContract } from '@/hooks/useContract'

// Mock third-party hooks
vi.mock('wagmi', () => ({
    useChainId: vi.fn(() => 31337)
}))

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
    useParams: vi.fn()
}))

// Mock custom hooks
vi.mock('@/hooks/useContract', () => ({
    useContract: vi.fn()
}))

vi.mock('@/hooks/useOffers', () => ({
    useOffers: vi.fn()
}))

// Mock Subcomponents
vi.mock('@/pages/Trade/Offers/OffersTable', () => ({
    default: ({ offers, loading }) => (
        <div data-testid="offers-table">
            Table: {offers.length} offers. Loading: {loading.toString()}
            {offers.map(o => <div key={o.id} data-testid="offer-item">{o.price}</div>)}
        </div>
    )
}))
vi.mock('@/pages/Trade/Offers/OffersFilters', () => ({
    default: () => <div data-testid="offers-filters">Filters</div>
}))
vi.mock('@/pages/Trade/Offers/TokenNav', () => ({
    default: () => <div data-testid="token-nav">TokenNav</div>
}))

describe('Offers Page', () => {
    const mockMarket = {
        getPrice: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useChainId).mockReturnValue(31337)
        vi.mocked(useContract).mockReturnValue({ Market: mockMarket } as any)
        vi.mocked(useParams).mockReturnValue({ side: 'buy', token: 'WBTC', fiat: 'USD' })
    })

    it('renders subcomponents and calculates prices', async () => {
        // Mock Offers Data
        const rawOffers = [
            { id: '1', rate: '10000', minFiat: 10, maxFiat: 100 } // Rate 1.0 (with 4 decimals)
        ]
        vi.mocked(useOffers).mockReturnValue({
            offers: rawOffers,
            totalCount: 1,
            loadMore: vi.fn(),
            refetch: vi.fn(),
            loading: false,
            error: null
        } as any)

        // Mock Market Price Query
        // Price Loading
        vi.mocked(useQuery).mockReturnValue({
            data: 100, // 100 USD per Token
            isLoading: false
        } as any)

        render(<Offers />)

        // Check Layout
        expect(screen.getByTestId('token-nav')).toBeDefined()
        expect(screen.getByTestId('offers-filters')).toBeDefined()
        expect(screen.getByTestId('offers-table')).toBeDefined()

        // Check Price Calculation
        // rawRate = 10000 -> 1.0
        // marketPrice = 100
        // calculatedPrice = 1.0 * 100 = 100.00
        await waitFor(() => {
            expect(screen.getByText('Table: 1 offers. Loading: false')).toBeDefined()
            // Check if price was calculated and passed to table
            // We rendered price in mock table
            expect(screen.getByText('100.00')).toBeDefined()
        })
    })

    it('handles loading state', async () => {
        vi.mocked(useOffers).mockReturnValue({
            offers: [],
            loading: true, // List loading
            refetch: vi.fn()
        } as any)

        vi.mocked(useQuery).mockReturnValue({
            data: null,
            isLoading: true // Price loading
        } as any)

        render(<Offers />)

        expect(screen.getByText(/Loading: true/)).toBeDefined()
    })
})
