import {Flex, Menu, Space} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import WalletMenu from "components/WalletMenu";
import NetworkSelector from "components/NetworkSelector";
import Notifications from "components/Notifications";
import logo from 'assets/images/logo.png';

export default function Topnav()
{
    const params = useParams();

    const top = [
        {
            key: 'sell',
            label: (<Link to={generatePath('/trade/sell/:token?/:fiat?/:method?', useParams() as any)}>Sell</Link>),
        },
        {
            key: 'buy',
            label: (<Link to={generatePath('/trade/buy/:token?/:fiat?/:method?', useParams() as any)}>Buy</Link>),
        },
    ];

    return (
        <div className={"width-container"}>
        <Flex justify={'space-between'}>
            <Flex>
                <Link style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}} to={"/"}>
                    <img alt={'Logo'} src={logo} style={{maxWidth: '40px', height: 'auto', marginRight: 20}} />
                </Link>
                <Menu mode={"horizontal"}
                      theme={"dark"}
                      items={top}
                      defaultSelectedKeys={[params.side]}
                      style={{minWidth: 200}}
                />
            </Flex>
            <Flex>
                <Space>
                    <NetworkSelector />
                    <Notifications />
                    <WalletMenu />
                </Space>
            </Flex>
        </Flex>
        </div>
    );
}
