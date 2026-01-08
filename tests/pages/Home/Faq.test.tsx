import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Faq from '@/pages/Home/Faq'

describe('Faq Component', () => {
    it('renders FAQ heading', () => {
        render(<Faq />)
        expect(screen.getByText('F.A.Q.')).toBeDefined()
    })

    it('renders questions', () => {
        render(<Faq />)
        // Check for a few keys questions
        expect(screen.getByText('How to trade Bitcoin?')).toBeDefined()
        expect(screen.getByText('Do you need a license?')).toBeDefined()
        expect(screen.getByText('Why Arbitrum?')).toBeDefined()
    })

    // We could test expansion if we wanted to be thorough, but checking rendering is sufficient for this static content.
})
