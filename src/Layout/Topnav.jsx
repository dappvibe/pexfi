import {Button, Col, Flex, Menu, Row, Space} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import WalletMenu from "../components/WalletMenu.jsx";
import {useWalletProvider} from "../hooks/useWalletProvider";
import NetworkSelector from "@/components/NetworkSelector.jsx";

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
        <Flex justify={'space-between'}>
            <Flex>
                <Link style={{width: 80}} to={"/"}>Logo</Link>
                <Menu mode={"horizontal"}
                      theme={"dark"}
                      items={top}
                      defaultSelectedKeys={[params.side]}
                      style={{minWidth: 200}}
                />
            </Flex>
            <Flex>
                <Space>
                    {account &&
                        <Button><Link to={'/trade/offer/new'}>Create Offer</Link></Button>
                    }
                    <NetworkSelector />
                    <WalletMenu />
                </Space>
            </Flex>
        </Flex>
    );
}
