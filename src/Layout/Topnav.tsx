import {Button, Flex, Menu, Space} from "antd";
import {generatePath, Link, useParams} from "react-router-dom";
import WalletMenu from "components/WalletMenu.jsx";
import NetworkSelector from "components/NetworkSelector.jsx";
import {useAccount} from "wagmi";
import Notifications from "components/Notifications";

export default function Topnav()
{
    const { address } = useAccount();
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
        <div className={"width-container"}>
        <Flex justify={'space-between'}>
            <Flex>
                <Link style={{width: 80}} to={"/"}>SOV</Link>
                <Menu mode={"horizontal"}
                      theme={"dark"}
                      items={top}
                      defaultSelectedKeys={[params.side]}
                      style={{minWidth: 200}}
                />
            </Flex>
            <Flex>
                <Space>
                    {address &&
                        <Button><Link to={'/trade/offer/new'}>Create Offer</Link></Button>
                    }
                    <NetworkSelector />
                    <Notifications />
                    <WalletMenu />
                </Space>
            </Flex>
        </Flex>
        </div>
    );
}
