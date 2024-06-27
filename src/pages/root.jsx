import {Layout, Menu} from "antd";
import React from "react";
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {Inventory, Market} from '../ethers.js'

const {Header, Content} = Layout;

export async function loader(...args) {
    console.log(...args);
    return {
        tokens: await Inventory.getTokens(),
        fiats: await Inventory.getFiats(),
        methods: await Inventory.getMethods(),
    };
}

const topmenu = [
    {key: "trade", label: "Trade"},
    {key: "offer-create", label: "Post Offer"}
];

export default function Root() {
    const {tokens, fiats, methods} = useLoaderData();
    return (
        <>
            <Layout>
                <Header style={{display: 'flex'}}>
                    <Menu mode={"horizontal"} items={topmenu} theme={"dark"}/>
                    <Link to={"/"}>Trade</Link>
                    <Link to={"/new"}>New</Link>
                    {tokens.map((token) => (
                        <li key={token[1]}><Link to={`/${token[1]}`}>{token[1]}</Link></li>
                    ))}
                </Header>
                <Content>
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
