import { ReactNode, useMemo } from 'react'
import { useChainId, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { config } from '@/wagmi.config'
import { SUBGRAPH_URLS } from '@/subgraph.config'
import { HelmetProvider } from '@dr.pogodin/react-helmet'
import { ConfigProvider, theme, App as AntdApp } from 'antd'

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
    cache: new InMemoryCache({
      typePolicies: {
        Offer: {
          keyFields: ['id'],
        },
        Deal: {
          keyFields: ['id'],
        },
        Profile: {
          keyFields: ['id'],
        },
      },
    }),
    queryDeduplication: true,
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
          <HelmetProvider>
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                  colorPrimary: '#d0bcff',
                  colorBgBase: '#131315',
                  colorSurface: '#131315',
                  borderRadius: 8,
                  fontFamily: 'Inter, sans-serif',
                },
                components: {
                  Layout: {
                    headerBg: '#131315',
                    bodyBg: '#131315',
                  },
                  Card: {
                    colorBgContainer: '#201f22',
                  },
                  Menu: {
                    darkItemBg: 'transparent',
                  },
                  Select: {
                    selectorBg: '#0e0e10',
                    borderBg: 'transparent',
                    colorBorder: 'transparent',
                    colorTextPlaceholder: 'rgba(255,255,255,0.25)',
                    controlHeightLG: 56,
                  },
                  Input: {
                    activeBorderColor: 'rgba(208, 188, 255, 0.4)',
                    hoverBorderColor: 'transparent',
                    colorBorder: 'transparent',
                  },
                  InputNumber: {
                    activeBorderColor: 'rgba(208, 188, 255, 0.4)',
                    hoverBorderColor: 'transparent',
                    colorBorder: 'transparent',
                  },
                  Radio: {
                    buttonBg: 'transparent',
                    buttonCheckedBg: '#353437',
                    buttonSolidCheckedBg: '#353437',
                    colorBorder: 'transparent',
                  }
                },
              }}
            >
              <AntdApp>{children}</AntdApp>
            </ConfigProvider>
          </HelmetProvider>
        </ApolloChainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
