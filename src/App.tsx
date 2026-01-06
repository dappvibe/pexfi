import { useMemo } from 'react'
import { createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import { useChainId } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import Layout from '@/layout'
import Home from '@/pages/Home/Home'
import Profile from '@/pages/Me/Profile'
import DealPage from '@/pages/Trade/Deal/Deal'
import UserDeals from '@/pages/Me/UserDeals'
import Offers from '@/pages/Trade/Offers/Offers'
import UserOffers from '@/pages/Me/Offers/UserOffers'
import OfferPage from '@/pages/Trade/Offer/Offer'
import OfferEdit from '@/pages/Trade/Offer/OfferEdit'
import OfferNew from '@/pages/Trade/Offer/OfferNew'

const router = createHashRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path={'/trade'}>
        <Route index element={<Navigate to={'/trade/sell'} />} />
        <Route path=":side/:token?/:fiat?/:method?" element={<Offers />} />
        <Route path={'offer/:offerId'} element={<OfferPage />} />
        <Route path={'offer/new'} element={<OfferNew />} />
        <Route path={'offer/edit/:offerId'} element={<OfferEdit />} />
        <Route path={'deal/:dealId'} element={<DealPage />} />
      </Route>
      <Route path={'/profile/:profile'} element={<Profile />} />
      <Route path={'/me'}>
        <Route index element={<Profile />} />
        <Route path={'offers'} element={<UserOffers />} />
        <Route path={'deals'} element={<UserDeals />} />
      </Route>
    </Route>
  )
)

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
  let uri: string
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

const App = () => {
  const chainId = useChainId()

  const apolloClient = useMemo(() => getApolloClient(chainId), [chainId])

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </QueryClientProvider>
  )
}
export default App
