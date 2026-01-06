import { ReactNode, useMemo } from 'react'
import { useChainId, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { config } from '@/wagmi.config'
import { HelmetProvider } from '@dr.pogodin/react-helmet'

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})

const getApolloClient = (chainId: number) => {
  let uri: string = ''
  if (chainId === 31337) {
    uri = 'http://localhost:8000/subgraphs/name/sov'
  } else if (import.meta.env.VITE_GRAPH_ENDPOINT) {
    uri = import.meta.env.VITE_GRAPH_ENDPOINT.replace('CHAINID', `${chainId}`)
  }

  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  })
}

const ApolloChainProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId()
  const apolloClient = useMemo(() => getApolloClient(chainId), [chainId])

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ApolloChainProvider>
          <HelmetProvider>{children}</HelmetProvider>
        </ApolloChainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
