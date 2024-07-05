import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider} from "react-router-dom";

import './main.css'
import {WalletProvider} from "./hooks/WalletProvider";
import {offersLoader} from "@/Trade/Offers/offersLoader.js";
import Layout from "./Layout";
import Home from "./Home/index.jsx";
import Profile from "./views/Profile.jsx";
import Deal from "@/Trade/Deal/Deal.jsx";
import {userDealsLoader, userOffersLoader} from "./js/loaders.js";
import Offer from "@/Trade/Offer/Offer.jsx";
import Deals from "./views/Deals.jsx";
import OfferNew from "./Trade/Offer/OfferNew.jsx";
import inventory from "@/loaders/inventory.js";
import TradeLayout from "@/Trade/TradeLayout.jsx";
import Offers from "@/Trade/Offers/Offers.jsx";
import {offerLoader} from "@/Trade/Offer/offerLoader.js";
import {dealLoader} from "@/Trade/Deal/dealLoader.js";

const router = createBrowserRouter( createRoutesFromElements(
    <Route element={<Layout />}>
        <Route index element={<Home/>} />
        <Route path={"/trade"} element={<TradeLayout/>} loader={inventory}>
            <Route index element={<Navigate to={"/trade/sell"} />} />
            <Route path=":side/:token?/:fiat?/:method?" element={<Offers />} loader={offersLoader}/>
            <Route path={"offer/:offerId"} element={<Offer/>} loader={offerLoader} />
            <Route path={"offer/new" } element={<OfferNew/>} />
            <Route path={"deal/:dealId"} element={<Deal/>} loader={dealLoader} />
        </Route>
        <Route path={"/me"} element={<Profile />}>
            <Route path={"offers/:address"} element={<Offers />} loader={userOffersLoader}/>
            <Route path={"deals/:address"} element={<Deals/>} loader={userDealsLoader}/>
        </Route>
    </Route>
));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <WalletProvider>
          <RouterProvider router={router} />
      </WalletProvider>
  </React.StrictMode>,
)
