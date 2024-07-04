import {Button, Col, Menu, Row} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import WalletMenu from "../components/WalletMenu.jsx";
import {useWalletProvider} from "../hooks/useWalletProvider";

export default function Topnav()
{
    const { account } = useWalletProvider();
    const params = useParams();

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
        <Row>
            <Col flex={"100px"}><Link to={"/"}>Fiat D.app</Link></Col>
            <Col flex={"auto"}>
                <Menu mode={"horizontal"}
                      theme={"dark"}
                      items={top}
                      selectedKeys={[params.side]}
                />
            </Col>
            <Col flex={"auto"}>
                {account && <Button><Link to={'/trade/offer/new'}>Create Offer</Link></Button>}
            </Col>
            <Col flex={"100px"}>
                <WalletMenu />
            </Col>
        </Row>
    );
}
