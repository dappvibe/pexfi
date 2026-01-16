import { render } from '@testing-library/react'
import { Providers } from '@/Providers'
import App from '@/App'

describe('App', () => {
  it('renders without crashing', () => {
    // App contains Router, so we test it within Providers to supply contexts
    render(
      <Providers>
        <App />
      </Providers>
    )
    expect(true).toBeTruthy()
  })
})
