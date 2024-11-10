import {Layout as AntLayout} from "antd";
import Topnav from "./Topnav.tsx";
import {Outlet} from "react-router-dom";
import {Footer} from "antd/es/layout/layout.js";
import {Announcement} from "@/components/Announcement.tsx";

const {Header, Content} = AntLayout;

export default function Layout()
{
    return (
    <AntLayout>
        <Header style={{padding: 0}}>
            <Topnav />
        </Header>
        <Content>
            <div style={{margin: 10}}>
                <Announcement />
            </div>
            <div className={"width-container"}>
                <Outlet />
            </div>
        </Content>
        <Footer />
    </AntLayout>
    );
}
