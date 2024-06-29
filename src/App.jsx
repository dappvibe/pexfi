import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, useLoaderData} from "react-router-dom";
import {Layout, Menu} from "antd";
const {Header, Content} = Layout;

export default function App() {
    const top = [
        {
            key: 'trade',
            label: (<Link to={"/trade/"}>Trade</Link>),
        },
        {
            key: 'create-offer',
            label: (<Link to={"/trade/new"}>Add Offer</Link>),
        },
    ];

    return (
        <>
            <Layout>
                <Header>
                    <Menu
                        mode={"horizontal"}
                        theme={"dark"}
                        items={top}
                        defaultSelectedKeys={['trade']}
                    >
                    </Menu>
                </Header>
                <Content>
                    <Outlet/>
                </Content>
            </Layout>
        </>
    );
}
