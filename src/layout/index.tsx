import {Layout as AntLayout} from "antd";
import Topnav from "./Topnav";
import {Outlet} from "react-router-dom";
import {Footer} from "antd/es/layout/layout.js";
import {Announcement} from "components/Announcement";

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
                <Announcement />
                <Outlet />
            </div>
        </Content>
        <Footer />
    </AntLayout>
    );
}
