import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";

import './main.css'
import {Layout, Menu} from "antd";
import Offers from "./pages/offers/list.jsx";
import OfferCreate from "./pages/offers/create.jsx";

const { Header, Content, Footer } = Layout;

const router = createBrowserRouter([
    {
        path: "/",
        element: <Offers />,
        children: [
            {
                path: "/sell",
                element: <Offers />,
            },
            {
                path: "/buy",
                element: <Offers />,
            }
        ]
    },
    {
        "path": '/new',
        element: <OfferCreate />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Layout>
          <Header
              style={{
                  display: 'flex',
                  alignItems: 'center',
              }}
          >
              <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['trade']}
                  style={{
                      flex: 1,
                      minWidth: 0,
                  }}
              >
                  <Menu.Item key="trade">Trade</Menu.Item>
                  <Menu.Item key="offer-create">Post Offer</Menu.Item>
              </Menu>
          </Header>
          <Content
              style={{
                  padding: '0 48px',
              }}
          >
              <div
                  style={{
                      background: '#fff',
                      minHeight: 280,
                      padding: 24,
                      borderRadius: '4px',
                  }}
              >
                  <RouterProvider router={router} />
              </div>
          </Content>
          <Footer
              style={{
                  textAlign: 'center',
              }}
          >
              {/* Add your Footer content here */}
          </Footer>
      </Layout>
  </React.StrictMode>,
)
