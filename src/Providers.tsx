import { ReactNode, useMemo } from 'react'
import { useChainId, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from '@apollo/client'
import { config } from '@/wagmi.config'
import { SUBGRAPH_URLS } from '@/subgraph.config'
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
  const uri = SUBGRAPH_URLS[chainId] || ''

  if (!uri && import.meta.env.DEV) {
    console.warn(`No subgraph URL configured for chain ID: ${chainId}`)
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
