import React, {Suspense} from 'react'
import {Await, generatePath, Link, Outlet, useLoaderData, useParams} from "react-router-dom";
import {Button, Col, Flex, Layout, Menu, Row, Skeleton} from "antd";
import Inventory from "./components/Inventory.jsx";
import WalletMenu from "./components/WalletMenu.jsx";
import {useWalletProvider} from "./hooks/useWalletProvider";

const {Header, Content, Sider} = Layout;

export default function App() {
    const { inventory } = useLoaderData();
    const { selectedAccount } = useWalletProvider();

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
            <Row>
                <Col flex={"100px"}><Link to={"/"}>Fiat D.app</Link></Col>
                <Col flex={"auto"}>
                    <Menu mode={"horizontal"}
                        theme={"dark"}
                        items={top}
                        defaultSelectedKeys={['sell']}
                    />
                </Col>
                <Col flex={"auto"}>
                    {selectedAccount && <Button><Link to={'/new'}>Create Offer</Link></Button>}
                </Col>
                <Col flex={"100px"}>
                    <WalletMenu />
                </Col>
            </Row>
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
