import { ethers } from "ethers";
import contracts from '../../contracts/deployed_addresses.json';
import { abi as InventoryAbi} from '../../contracts/artifacts/Inventory_Inventory.json';
import { abi as MarketAbi} from '../../contracts/artifacts/Market_ERC1967Proxy.json';
import { abi as RepTokenAbi} from '../../contracts/artifacts/RepToken.json';
import {useEffect, useState} from "react";
import {useWalletProvider} from "./useWalletProvider";
export function useContract()
{
    const { wallet, account } = useWalletProvider();

    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const [inventory, setInventory] = useState(new ethers.Contract(
        contracts['Inventory#Inventory'],
        InventoryAbi,
        provider
    ));
    const [market, setMarket] = useState(new ethers.Contract(
        contracts['Market#ERC1967Proxy'],
        MarketAbi,
        provider
    ));
    const [repToken, setRepToken] = useState(new ethers.Contract(
        contracts['Rep#RepToken'],
        RepTokenAbi,
        provider
    ));

    useEffect(() => {
        if (account) {
            const provider = new ethers.BrowserProvider(wallet.provider);
            provider.getSigner().then((signer) => {
                setInventory(inventory.connect(signer));
                setMarket(market.connect(signer));
                setRepToken(repToken.connect(signer));
            });
        }
    }, [account]);

    return {
        inventory,
        market,
        repToken
    };
}
