import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {Layout, Menu} from "antd";
const {Header, Content} = Layout;

export default function App() {
    const top = [
        {
            key: 'buy',
            label: (<Link to={"/trade/buy"}>Buy</Link>)
        },
        {
            key: 'sell',
            label: (<Link to={"/trade/sell"}>Sell</Link>),
        }
    ];

    return (
        <>
            <Layout>
                <Header>
                    <Menu
                        mode={"horizontal"}
                        theme={"dark"}
                        items={top}
                    >
                    </Menu>
                </Header>
                <Content>
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
