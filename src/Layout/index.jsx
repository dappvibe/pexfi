import {Layout as AntLayout} from "antd";
import Topnav from "./Topnav.jsx";
import {Outlet, useParams} from "react-router-dom";

const {Header, Content} = AntLayout;

export default function Layout()
{
    return (
    <AntLayout>
        <Header style={{padding: 0}}>
            <Topnav />
        </Header>
        <Content>
            <Outlet />
        </Content>
    </AntLayout>
    );
}
