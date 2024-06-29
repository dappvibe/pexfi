import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router-dom";

import './main.css'
import Offers from "./screens/Offers.jsx";
import App from "./App.jsx";
import {offersLoader} from "./js/loaders.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
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
    <RouterProvider router={router} />
  </React.StrictMode>,
)
