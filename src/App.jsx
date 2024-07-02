import React, {Suspense} from 'react'
import {Await, generatePath, Link, Outlet, useLoaderData, useParams} from "react-router-dom";
import {Flex, Layout, Menu, Skeleton} from "antd";
import Inventory from "./components/Inventory.jsx";
import WalletMenu from "./components/WalletMenu.jsx";
import {useWalletProvider} from "./hooks/useWalletProvider";

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
                    <WalletMenu />
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
