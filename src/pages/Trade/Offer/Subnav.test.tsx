import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Subnav from './Subnav'

describe('Subnav', () => {
  it('renders successfully', () => {
    const offer = {
      token: 'TST',
      fiat: 'USD',
      method: 'Bank',
    }

    render(
      <MemoryRouter>
        <Subnav offer={offer} />
      </MemoryRouter>
    )

    expect(screen.getByText('Back to offers')).toBeTruthy()
  })
})
