import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OfferSubnav from '@/features/offers/components/OfferSubnav'

describe('OfferSubnav', () => {
  it('renders successfully', () => {
    const offer = {
      token: 'TST',
      fiat: 'USD',
      method: 'Bank',
    }

    render(
      <MemoryRouter>
        <OfferSubnav offer={offer} />
      </MemoryRouter>
    )

    expect(screen.getByText('Back to offers')).toBeTruthy()
  })
})

