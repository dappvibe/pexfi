import {Layout as AntLayout} from "antd";
import Topnav from "./Topnav.jsx";
import {Outlet} from "react-router-dom";
import {Footer} from "antd/es/layout/layout.js";

const {Header, Content} = AntLayout;

export default function Layout()
{
    return (
    <AntLayout>
        <Header style={{padding: 0}}>
            <Topnav />
        </Header>
        <Content>
            <div className={"width-container"}>
                <Outlet />
            </div>
        </Content>
        <Footer />
    </AntLayout>
    );
}
