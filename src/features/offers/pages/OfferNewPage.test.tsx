import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OfferNewPage from '@/features/offers/pages/OfferNewPage'

// Mock useOfferForm hook
vi.mock('@/features/offers/hooks/useOfferForm', () => ({
  useOfferForm: vi.fn(() => ({
    form: {},
    tokens: {},
    fiats: [],
    methods: {},
    inventoryLoading: false,
    lockSubmit: false,
    onFinish: vi.fn(),
    fetchRate: vi.fn(),
    previewPrice: vi.fn(),
    handleSetRate: vi.fn(),
    handleSetLimits: vi.fn(),
    handleSetTerms: vi.fn(),
    handleToggleDisabled: vi.fn(),
  })),
}))

// Mock OfferForm
vi.mock('@/features/offers/components/OfferForm', () => ({
  default: () => <div data-testid="offer-form">Mock Offer Form</div>,
}))

describe('OfferNewPage', () => {
  it('renders Card with OfferForm', () => {
    render(<OfferNewPage />)
    expect(screen.getByText('Publish an Offer')).toBeDefined()
    expect(screen.getByTestId('offer-form')).toBeDefined()
  })
})
