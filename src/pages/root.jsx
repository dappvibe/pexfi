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
    return (
        <>
            <Layout>
                <Header style={{display: 'flex'}}>
                    <Menu mode={"horizontal"} theme={"dark"}>
                        <Menu.Item key={"trade"}>
                            <Link to={"/"}>Trade</Link>
                        </Menu.Item>
                        <Menu.Item key={"offer-create"}>
                            <Link to={"/new"}>Post Offer</Link>
                        </Menu.Item>
                    </Menu>
                </Header>
                <Content>
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
