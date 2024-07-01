import {useSDK} from "@metamask/sdk-react";
import React, {useEffect, useState} from "react";
import {Button, Dropdown, message} from "antd";
import {DownOutlined} from "@ant-design/icons";

export default function WalletConnector() {
    const { sdk, connected, connecting, provider, chainId } = useSDK();
    const [account, setAccount] = useState();
    const [wallet, setWallet] = useState({ accounts: [] })

    useEffect(() => {
        const refreshAccounts = (accounts) => {
            if (accounts.length > 0) {
                setWallet({ accounts });
            } else {
                // if length 0, user is disconnected
                setWallet({ accounts: [] })
            }
        }

        const getProvider = async () => {
            const accounts = await window.ethereum.request(
                { method: 'eth_accounts' }
            )
            refreshAccounts(accounts)
            window.ethereum.on('accountsChanged', refreshAccounts)
        }

        getProvider()
        return () => {
            window.ethereum?.removeListener('accountsChanged', refreshAccounts)
        }
    }, [])

    const handleConnect = async () => {
        let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        })
        setWallet({ accounts });
    }

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
            <Button onClick={handleConnect}>Connect</Button>
        )}
        {connected && (
            <Dropdown menu={accMenu}>
                <Button>
                    {shortenAddress(wallet.accounts[0])}
                    <DownOutlined />
                </Button>
            </Dropdown>
        )}
        </>
    );
}
