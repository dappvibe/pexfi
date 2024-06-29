import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import { MetaMaskProvider } from "@metamask/sdk-react";
import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router-dom";

import './main.css'
import Offers from "./screens/Offers.jsx";
import App from "./App.jsx";
import {inventory, offersLoader} from "./js/loaders.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        loader: inventory,
        children: [
            {
                path: "/trade/:side?/:token?/:fiat?/:method?",
                element: <Offers />,
                loader: offersLoader
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
  </React.StrictMode>,
)
