import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OfferNew from '@/pages/Trade/Offer/OfferNew'

// Mock OfferForm
vi.mock('@/pages/Trade/Offer/OfferForm', () => ({
    default: () => <div data-testid="offer-form">Mock Offer Form</div>
}))

describe('OfferNew', () => {
    it('renders Card with OfferForm', () => {
        render(<OfferNew />)
        expect(screen.getByText('Publish an Offer')).toBeDefined()
        expect(screen.getByTestId('offer-form')).toBeDefined()
    })
})
