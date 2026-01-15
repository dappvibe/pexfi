import { vi } from 'vitest'

// Create specific mock contract methods
const mockOfferFactory = {
  create: vi.fn(),
}

const mockMarket = {
    interface: {
        parseLog: vi.fn(),
    },
    getPrice: vi.fn(() => 2000000000n), // 2000.00 USD/Token (6 decimals for price typically if token is 18?)
    // Wait, getPrice usually returns price with some precision.
    // In OfferForm: price = (price / 10 ** 6).toFixed(2)
    // So if we want 2000, we need 2000 * 10^6 = 2000000000
}

const mockOffer = {
    attach: vi.fn(() => mockOffer), // Returns self for chaining
    setRate: vi.fn(),
    setLimits: vi.fn(),
    setTerms: vi.fn(),
    setDisabled: vi.fn(),
}

export const mockContracts = {
  OfferFactory: mockOfferFactory,
  Market: mockMarket,
  Offer: mockOffer,
  signed: vi.fn((contract) => Promise.resolve({
    ...contract,
    create: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({
            logs: []
        })
    }),
    setRate: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({})
    }),
    setLimits: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({})
    }),
    setTerms: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({})
    }),
    setDisabled: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({})
    })
  })), // Helper to simulate signing
}

export const useContract = vi.fn(() => mockContracts)
