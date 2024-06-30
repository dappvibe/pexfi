import {useSDK} from "@metamask/sdk-react";
import React, {useState} from "react";
import {Button, Dropdown, message} from "antd";
import {DownOutlined} from "@ant-design/icons";

export default function WalletConnector() {
    const { sdk, connected, connecting, provider, chainId } = useSDK();
    const [account, setAccount] = useState();

    const connect = async () => {
        try {
            const accounts = await sdk?.connect();
            setAccount(accounts?.[0]);
            message.info('Welcome');
        } catch (err) {
            console.warn("failed to connect..", err);
        }
    };
    const disconnect = async () => {
        await sdk?.terminate();
        message.info('Bye');
    };

    const items = [
        {
            label: 'Disconnect',
            key: 'disconnect',
            onClick: disconnect,
        }
    ];
    const accMenu = {
        items,
    };

    function shortenAddress(address) {
        if (!address) return 'Unknown';
        return address.slice(0, 7) + '..' + address.slice(-5);
    }

    return (
        <>
        {!connected && (
            <Button onClick={connect}>Connect</Button>
        )}
        {connected && (
            <Dropdown menu={accMenu}>
                <Button>
                    {shortenAddress(account)}
                    <DownOutlined />
                </Button>
            </Dropdown>
        )}
        </>
    );
}
