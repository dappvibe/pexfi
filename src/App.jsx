import React, {createContext, Suspense, useContext, useState} from 'react'
import ReactDOM from 'react-dom/client'
import {Await, generatePath, Link, Outlet, useLoaderData, useLocation, useNavigate, useParams} from "react-router-dom";
import {Button, Flex, Form, Input, Layout, Menu, Select, Skeleton, Dropdown, Tooltip, Space, message} from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import {useSDK} from "@metamask/sdk-react";
import Inventory from "./components/Inventory.jsx";
const {Header, Content, Sider} = Layout;

export default function App() {
    const { sdk, connected, connecting, provider, chainId } = useSDK();
    const [account, setAccount] = useState();
    const { inventory } = useLoaderData();

    const connect = async () => {
        try {
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);
            message.info('Welcome');
        } catch (err) {
            console.warn("failed to connect..", err);
        }
    };
    const disconnect = async () => {
        await sdk?.terminate();
        message.info('Bye');
    };

    const items = [
        {
            label: 'Disconnect',
            key: 'disconnect',
            onClick: disconnect,
        }
    ];
    const accMenu = {
        items,
    };

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

    function shortenAddress(address) {
        if (!address) return 'Unknown';
        return address.slice(0, 7) + '..' + address.slice(-5);
    }

    return (
        <>
            <Layout>
                <Header>
                    <Layout>
                        <Content>
                            <Menu
                                mode={"horizontal"}
                                theme={"dark"}
                                items={top}
                                defaultSelectedKeys={['sell']}
                            />
                        </Content>
                        <Sider align={"end"}>
                            {!connected && (
                                <Button onClick={connect}>Connect</Button>
                            )}
                            {connected && (
                                <Dropdown menu={accMenu}>
                                    <Button>
                                        {shortenAddress(account)}
                                        <DownOutlined />
                                    </Button>
                                </Dropdown>
                            )}
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
