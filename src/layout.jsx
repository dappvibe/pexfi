import {Layout, Menu} from "antd";
import {Link, RouterProvider} from "react-router-dom";
import React from "react";
const { Header, Content, Footer } = Layout;

const AppLayout = () => {
    return (
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['trade']}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Menu.Item key="trade">Trade</Menu.Item>
                    <Menu.Item key="offer-create">Post Offer</Menu.Item>
                    <Link to={`/new`}>New</Link>
                </Menu>
            </Header>
            <Content
                style={{
                    padding: '0 48px',
                }}
            >
                <div
                    style={{
                        background: '#fff',
                        minHeight: 280,
                        padding: 24,
                        borderRadius: '4px',
                    }}
                >
                    <RouterProvider router={router} />
                </div>
            </Content>
            <Footer
                style={{
                    textAlign: 'center',
                }}
            >
                {/* Add your Footer content here */}
            </Footer>
        </Layout>
    );
}
export default AppLayout
