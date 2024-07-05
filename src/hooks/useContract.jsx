import { ethers } from "ethers";
import contracts from '../../contracts/deployed_addresses.json';
import { abi as InventoryAbi} from '../../contracts/artifacts/Inventory_Inventory.json';
import { abi as MarketAbi} from '../../contracts/artifacts/Market_ERC1967Proxy.json';
import { abi as RepTokenAbi} from '../../contracts/artifacts/RepToken.json';
import { abi as DealAbi} from '../../contracts/artifacts/Deal.json';
import { abi as ERC20Abi } from '../../contracts/artifacts/ERC20.json';
import {useEffect, useState} from "react";
import {useWalletProvider} from "./useWalletProvider";

// eslint-disable-next-line react-refresh/only-export-components
export const provider = new ethers.JsonRpcProvider('http://localhost:8545');
export const InventoryContract = new ethers.Contract( contracts['Inventory#Inventory'], InventoryAbi, provider );
export const MarketContract = new ethers.Contract( contracts['Market#ERC1967Proxy'], MarketAbi, provider );
export const RepTokenContract = new ethers.Contract( contracts['Rep#RepToken'], RepTokenAbi, provider );
export const TokenContract = new ethers.Contract( '0x', ERC20Abi, provider );

export const DealContract = new ethers.Contract( '0x', DealAbi, provider );

// eslint-disable-next-line react-refresh/only-export-components
export function useContract()
{
    const { wallet } = useWalletProvider();

    const inventory = InventoryContract;
    const deal = DealContract;
    const market = MarketContract;
    const repToken = RepTokenContract;
    const token = TokenContract;

    const [signed, setSigned] = useState(() => ()=> console.warn('singer is not available'));

    useEffect(() => {
        if (wallet) {
            const getSigner = async (contract) => {
                const provider = new ethers.BrowserProvider(wallet.provider);
                const signer = await provider.getSigner();
                return contract.connect(signer);
            };
            setSigned(() => getSigner)
        }
    }, [wallet]);

    return {
        inventory,
        market,
        deal,
        token,
        repToken,
        signed
    };
}
