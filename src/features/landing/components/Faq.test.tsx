import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Faq from '@/features/landing/components/Faq'

describe('Faq', () => {
  it('renders FAQ heading', () => {
    render(<Faq />)
    expect(screen.getByText('F.A.Q.')).toBeDefined()
  })

  it('renders questions', () => {
    render(<Faq />)
    expect(screen.getByText('How to trade Bitcoin?')).toBeDefined()
    expect(screen.getByText('Do you need a license?')).toBeDefined()
    expect(screen.getByText('Are there any fees?')).toBeDefined()
  })
})
