import React from 'react'
import {generatePath, Link, Outlet, useParams} from "react-router-dom";
import {Button, Col, Layout, Menu, Row} from "antd";
import WalletMenu from "./components/WalletMenu.jsx";
import {useWalletProvider} from "./hooks/useWalletProvider";

const {Header, Content, Sider} = Layout;

export default function App() {
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
            <Outlet/>
        </Content>
    </Layout>
    </>
    );
}
