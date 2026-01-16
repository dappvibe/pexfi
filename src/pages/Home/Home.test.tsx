import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/pages/Home/Home'

// Mock Faq component to test Home in isolation (optional, but good practice if Faq is complex)
// However, Faq is simple, so we can test integration or mock it.
// Let's mock it to focus on Home structure.
vi.mock('@/pages/Home/Faq', () => ({
  default: () => <div data-testid="faq-section">Mocked FAQ</div>,
}))

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Home />)
    expect(screen.getByText(/Fully Decentralized P2P Crypto Marketplace/i)).toBeDefined()
  })

  it('renders feature cards', () => {
    render(<Home />)
    expect(screen.getByText('Unstoppable')).toBeDefined()
    expect(screen.getByText('Non-custodial')).toBeDefined()
    expect(screen.getByText('Anonymous')).toBeDefined()
    expect(screen.getByText('No Limits')).toBeDefined()
    expect(screen.getByText('Tokenized Reputation')).toBeDefined()
    expect(screen.getByText('Secure')).toBeDefined()
  })

  it('renders FAQ section', () => {
    render(<Home />)
    expect(screen.getByTestId('faq-section')).toBeDefined()
  })
})
