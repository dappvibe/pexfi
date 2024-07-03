import { ethers } from "ethers";
import contracts from '../../contracts/deployed_addresses.json';
import { abi as InventoryAbi} from '../../contracts/artifacts/Inventory_Inventory.json';
import { abi as MarketAbi} from '../../contracts/artifacts/Market_ERC1967Proxy.json';
import {useEffect, useState} from "react";
import {useWalletProvider} from "./useWalletProvider";
export function useContract()
{
    const { selectedWallet } = useWalletProvider();
    const [inventory, setInventory] = useState(new ethers.Contract(
        contracts['Inventory#Inventory'],
        InventoryAbi));
    const [market, setMarket] = useState(new ethers.Contract(
        contracts['Market#ERC1967Proxy'],
        MarketAbi
    ));

    useEffect(() => {
        if (selectedWallet) {
            const provider = new ethers.BrowserProvider(selectedWallet.provider);
            provider.getSigner().then((signer) => {
                setInventory(inventory.connect(signer));
                setMarket(market.connect(signer));
            });
        } else {
            const provider = new ethers.JsonRpcProvider('http://localhost:8545');
            setInventory(inventory.connect(provider));
            setMarket(market.connect(provider));
        }
    }, [selectedWallet]);

    return {
        inventory,
        market
    };
}
