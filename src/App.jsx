import React, {createContext, useContext, useState} from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, useLoaderData, useLocation, useNavigate, useParams} from "react-router-dom";
import {Button, Flex, Form, Input, Layout, Menu, Select, Skeleton, Dropdown, Tooltip, Space, message} from "antd";
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import {useSDK} from "@metamask/sdk-react";
const {Header, Content, Sider} = Layout;

export default function App() {
    const { sdk, connected, connecting, provider, chainId } = useSDK();
    const [account, setAccount] = useState();
    const { tokens, fiats, methods } = useLoaderData();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = 'ANY'
    } = useParams();
    const navigate = useNavigate();

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

    // TODO sort top 10 fiats and then otherss

    const top = [
        // TODO keep selected params in the URL
        {
            key: 'sell',
            label: (<Link to={"/trade/sell"}>Sell</Link>),
        },
        {
            key: 'buy',
            label: (<Link to={"/trade/buy"}>Buy</Link>),
        },
    ];

    function constructUrl(token) {
        let url = "/trade";
        if (side) url += `/${side}`;
        url += `/${token}`;
        if (fiat) url += `/${fiat}`;
        if (method && method !== 'ANY') url += `/${method}`;
        return url;
    }
    const tokensMenu = Object.keys(tokens).map(token => {
        return {
            key: token,
            label: (<Link to={constructUrl(token)}>{tokens[token].symbol}</Link>),
        }
    });

    const fiatSelect = Object.keys(fiats).map(fiat => {
        return {
            value: fiat,
            label: fiat,
        }
    });
    const methodSelect = Object.keys(methods).map(methoda => {
        return {
            value: methoda,
            label: methoda,
        }
    });

    function handleFiatChange(fiat) {
        // Construct the new URL
        let url = "/trade";
        if (side) url += `/${side}`;
        if (token) url += `/${token}`;
        url += `/${fiat}`;
        if (method && method !== 'ANY') url += `/${method}`;
        navigate(url);
    }

    function handleMethodChange(methodb) {
        // Construct the new URL
        let url = "/trade";
        url += `/${side}`;
        url += `/${token}`;
        url += `/${fiat}`;
        url += `/${methodb}`;
        navigate(url);
    }

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
                    <Menu
                        mode={"horizontal"}
                        items={tokensMenu}
                        defaultSelectedKeys={[token]}
                    />
                    <Input placeholder={"Amount"}></Input>
                    <Select
                        showSearch
                        placeholder="Search to Select"
                        optionFilterProp="label"
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        options={fiatSelect}
                        defaultValue={fiat}
                        onChange={handleFiatChange}
                    />
                    <Select
                        showSearch
                        style={{
                            width: 200,
                        }}
                        placeholder="Payment method"
                        optionFilterProp="label"
                        options={methodSelect}
                        onChange={handleMethodChange}
                    />

                    {/*<Skeleton active={true}></Skeleton>*/}
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
