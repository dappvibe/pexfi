import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, useLoaderData, useLocation, useParams} from "react-router-dom";
import {Layout, Menu, Skeleton} from "antd";
const {Header, Content} = Layout;

export default function App() {
    const { tokens, fiats, methods } = useLoaderData();
    let {
        side = 'sell',
        token = 'WBTC',
        fiat = 'USD',
        method = 'ANY'
    } = useParams();

    const location = useLocation();

    const top = [
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
        if (token) url += `/${token}`;
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

    const fiatsMenu = Object.keys(fiats).map(fiat => {
        return {
            key: fiat,
            label: fiat,
        }
    });


    return (
        <>
            <Layout>
                <Header>
                    <Menu
                        mode={"horizontal"}
                        theme={"dark"}
                        items={top}
                        defaultSelectedKeys={['sell']}
                    >
                    </Menu>
                </Header>
                <Content>
                    <Menu
                        mode={"horizontal"}
                        items={tokensMenu}
                        defaultSelectedKeys={['USDT']}
                    >
                    </Menu>
                    <Menu
                        mode={"horizontal"}
                        items={fiatsMenu}
                    >
                    </Menu>
                    {/*<Skeleton active={true}></Skeleton>*/}
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
