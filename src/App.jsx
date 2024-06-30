import React, {createContext, Suspense, useContext, useState} from 'react'
import {Await, generatePath, Link, Outlet, useLoaderData, useLocation, useNavigate, useParams} from "react-router-dom";
import {Button, Flex, Form, Input, Layout, Menu, Select, Skeleton, Dropdown, Tooltip, Space, message} from "antd";
import Inventory from "./components/Inventory.jsx";
import WalletConnector from "./components/WalletConnector.jsx";
const {Header, Content, Sider} = Layout;

export default function App() {
    const { inventory } = useLoaderData();

    const top = [
        {
            key: 'sell',
            label: (<Link to={generatePath('/trade/sell/:token?/:fiat?/:method?', useParams())}>Sell</Link>),
        },
        {
            key: 'buy',
            label: (<Link to={generatePath('/trade/buy/:token?/:fiat?/:method?', useParams())}>Buy</Link>),
        },
    ];

    return (
    <>
    <Layout>
        <Header style={{paddingLeft: 0}}>
            <Layout>
                <Flex style={{padding: '0 10px'}}><Link to={"/"}>Fiat D.app</Link></Flex>
                <Content>
                    <Menu
                        mode={"horizontal"}
                        theme={"dark"}
                        items={top}
                        defaultSelectedKeys={['sell']}
                    />
                </Content>
                <Sider align={"end"}>
                    <WalletConnector />
                </Sider>
            </Layout>
        </Header>
        <Content>
            <Suspense fallback={<Skeleton paragraph={false} active />}>
                <Await resolve={inventory}>
                    {(inventory) => (<Inventory data={inventory}/>)}
                </Await>
            </Suspense>
            <Outlet/>
        </Content>
    </Layout>
    </>
    );
}
