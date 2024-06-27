import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, Link, Outlet, RouterProvider} from "react-router-dom";

import './main.css'
import {Layout, Menu} from "antd";
import Offers from "./pages/offers/list.jsx";
import OfferCreate from "./pages/offers/create.jsx";
import Root, {loader} from "./pages/root.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        loader: loader,
        children: [
            {
                path: "/:token",
                element: <Offers />,
            },
            {
                path: '/new',
                element: <OfferCreate />
            }
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
