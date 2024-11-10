import React from 'react'
import ReactDOM from 'react-dom/client'
import {createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider} from "react-router-dom";
import {WagmiProvider} from "wagmi";
import {config} from "wagmi.config";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import './main.css'

import Layout from "./layout";
import Home from "./pages/Home/Home";
import Profile from "pages/Me/Profile";
import DealPage from "pages/Trade/Deal/Deal";
import UserDeals from "pages/Me/UserDeals";
import Offers from "pages/Trade/Offers/Offers";
import UserOffers from "pages/Me/Offers/UserOffers";
import OfferPage from "pages/Trade/Offer/Offer";
import OfferEdit from "pages/Trade/Offer/OfferEdit";
import OfferNew from "pages/Trade/Offer/OfferNew";


const router = createHashRouter( createRoutesFromElements(
    <Route element={<Layout />}>
        <Route index element={<Home/>} />
        <Route path={"/trade"}>
            <Route index element={<Navigate to={"/trade/sell"} />} />
            <Route path=":side/:token?/:fiat?/:method?" element={<Offers />}/>
            <Route path={"offer/:offerId"} element={<OfferPage />} />
            <Route path={"offer/new" } element={<OfferNew/>} />
            <Route path={"offer/edit/:offerId" } element={<OfferEdit/>} />
            <Route path={"deal/:dealId"} element={<DealPage />} />
        </Route>
        <Route path={"/profile/:profile"} element={<Profile />} />
        <Route path={"/me"}>
            <Route index element={<Profile />} />
            <Route path={"offers"} element={<UserOffers />}/>
            <Route path={"deals"} element={<UserDeals/>} />
        </Route>
    </Route>
));

const queryClient = new QueryClient()
const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
});
persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

const apolloClient = new ApolloClient({
    uri: 'http://localhost:8000/subgraphs/name/sov',
    cache: new InMemoryCache()
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
              <ApolloProvider client={apolloClient}>
                  <RouterProvider router={router} />
              </ApolloProvider>
          </QueryClientProvider>
      </WagmiProvider>
  </React.StrictMode>,
)
