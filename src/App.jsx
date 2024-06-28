import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {Layout, Menu} from "antd";
const {Header, Content} = Layout;

export default function App() {
    return (
        <>
            <Layout>
                <Header style={{display: 'flex'}}>
                    <Menu mode={"horizontal"} theme={"dark"}>
                        <Menu.Item key={"trade-sell"}><Link to={"/trade/sell"}>Sell</Link></Menu.Item>
                        <Menu.Item key={"trade-buy"}><Link to={"/trade/buy"}>Buy</Link></Menu.Item>
                    </Menu>
                </Header>
                <Content>
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
