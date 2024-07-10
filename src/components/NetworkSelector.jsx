import {useWalletProvider} from "@/hooks/useWalletProvider";
import {useEffect, useState} from "react";
import {Select} from "antd";

export default function NetworkSelector()
{
    const { account, wallet } = useWalletProvider();

    const [chainId, setChainId] = useState();

    const chains = {
        "0x66eee": {
            chainId: "0x66eee",
            chainName: "Arbitrum Sepolia",
            nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
            blockExplorerUrls: ["https://sepolia.arbiscan.io/"]
        },
        "0x7a69": {
            chainId: "0x7a69",
            chainName: "Hardhat",
            nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18
            },
            rpcUrls: ['http://localhost:8545'],
            blockExplorerUrls: ["http://localhost"]
        }
    };

    function selectChain(id) {
        wallet.provider.request({
            method: "wallet_addEthereumChain",
            params: [ chains[id] ]
        }).then(() => location.reload());
    }

    useEffect(() => {
        if (!wallet) return () => {};

        wallet.provider.request({
            "method": "eth_chainId",
            "params": []
        }).then(id => {
            if (!chains[id]) {
                selectChain(Object.keys(chains)[0]);
            }
            setChainId(id);
        });
    }, [wallet, account]);

    const options = [];
    for (let id in chains) {
        options.push({
            label: chains[id].chainName,
            value: id
        });
    }

    return (<Select style={{width: 150}} options={options} value={chainId} onSelect={selectChain} />);
}
