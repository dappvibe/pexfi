import { render, screen } from '@testing-library/react'
import { Providers } from '@/Providers'
import { useQueryClient } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client/react'

// Helper component to verify contexts
const ContextChecker = () => {
  const queryClient = useQueryClient()
  const apolloClient = useApolloClient()

  // We can't easily check Wagmi Context because it's mocked to be a pass-through in setup.ts
  // But checking Query and Apollo confirms the tree is mounting correctly.

  return (
    <div>
      <div data-testid="query-client">{queryClient ? 'QueryClient Present' : 'Missing'}</div>
      <div data-testid="apollo-client">{apolloClient ? 'ApolloClient Present' : 'Missing'}</div>
    </div>
  )
}

describe('Providers', () => {
  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">Child Component</div>
      </Providers>
    )
    expect(screen.getByTestId('child')).not.toBeNull()
  })

  it('provides QueryClient and ApolloClient contexts', () => {
    render(
      <Providers>
        <ContextChecker />
      </Providers>
    )
    expect(screen.getByTestId('query-client').textContent).toContain('QueryClient Present')
    expect(screen.getByTestId('apollo-client').textContent).toContain('ApolloClient Present')
  })
})
