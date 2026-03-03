import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/features/landing/pages/LandingPage'

vi.mock('@/features/landing/components/Faq', () => ({
  default: () => <div data-testid="faq-section">Mocked FAQ</div>,
}))

describe('LandingPage', () => {
  it('renders main heading', () => {
    render(<LandingPage />)
    expect(screen.getByText(/Fully Decentralized P2P Crypto Marketplace/i)).toBeDefined()
  })

  it('renders feature cards', () => {
    render(<LandingPage />)
    expect(screen.getByText('Unstoppable')).toBeDefined()
    expect(screen.getByText('Non-custodial')).toBeDefined()
    expect(screen.getByText('Anonymous')).toBeDefined()
    expect(screen.getByText('No Limits')).toBeDefined()
    expect(screen.getByText('Tokenized Reputation')).toBeDefined()
    expect(screen.getByText('Secure')).toBeDefined()
  })

  it('renders FAQ section', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('faq-section')).toBeDefined()
  })
})
