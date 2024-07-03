import React from 'react'
import ReactDOM from 'react-dom/client'
import {MetaMaskProvider} from "@metamask/sdk-react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import './main.css'
import Offers from "./views/Offers.jsx";
import App from "./App.jsx";
import {dealLoader, inventory, offerLoader, offersLoader, userDealsLoader, userOffersLoader} from "./js/loaders.js";
import Offer from "./views/Offer.jsx";
import Deal from "./views/Deal.jsx";
import {WalletProvider} from "./hooks/WalletProvider";
import NewOffer from "./views/NewOffer.jsx";
import Deals from "./views/Deals.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: inventory,
        children: [
            {
                path: "/trade/deal/:dealId",
                element: <Deal />,
                loader: dealLoader
            },
            {
                path: "/trade/:side?/:token?/:fiat?/:method?",
                element: <Offers />,
                loader: offersLoader
            },
            {
                path: "/trade/:side/:token/:fiat/:method/:offerId",
                element: <Offer />,
                loader: offerLoader
            },
            {
                path: "/new",
                element: <NewOffer />,
                loader: inventory
            },
            {
                path: "/trade/offers/:address",
                element: <Offers />,
                loader: userOffersLoader
            },
            {
                path: "/trade/deals/:address",
                element: <Deals />,
                loader: userDealsLoader
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <WalletProvider>
          <MetaMaskProvider
              debug={false}
              sdkOptions={{
                  dappMetadata: {
                      name: "Market",
                      url: window.location.href,
                  },
                  // Other options.
              }}
          >
              <RouterProvider router={router} />
          </MetaMaskProvider>
      </WalletProvider>
  </React.StrictMode>,
)
