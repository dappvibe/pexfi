import { ethers } from "ethers";
import contracts from '../../contracts/deployed_addresses.json';
import { abi as MarketAbi} from '../../contracts/artifacts/Market.json';
import { abi as RepTokenAbi} from '../../contracts/artifacts/RepToken.json';
import { abi as DealAbi} from '../../contracts/artifacts/Deal.json';
import { abi as OfferAbi} from '../../contracts/artifacts/Offer.json';
import { abi as OfferFactoryAbi} from '../../contracts/artifacts/OfferFactory.json';
import { abi as DealFactoryAbi } from '../../contracts/artifacts/DealFactory.json';
import { abi as ERC20Abi } from '../../contracts/artifacts/ERC20.json';
import {useEffect, useState} from "react";
import {useWalletProvider} from "./useWalletProvider";

// eslint-disable-next-line react-refresh/only-export-components
export const provider = new ethers.JsonRpcProvider('http://localhost:8545');
export const MarketContract = new ethers.Contract( contracts['Market#Market'], MarketAbi, provider );
export const RepTokenContract = new ethers.Contract( contracts['RepToken#RepToken'], RepTokenAbi, provider );
export const OfferFactoryContract = new ethers.Contract( contracts['OfferFactory#OfferFactory'], OfferFactoryAbi, provider );
export const DealFactoryContract = new ethers.Contract( contracts['DealFactory#DealFactory'], DealFactoryAbi, provider );
export const TokenContract = new ethers.Contract( '0x', ERC20Abi, provider );
export const OfferContract = new ethers.Contract( '0x', OfferAbi, provider );
export const DealContract = new ethers.Contract( '0x', DealAbi, provider );

// eslint-disable-next-line react-refresh/only-export-components
export function useContract()
{
    const { wallet } = useWalletProvider();

    const deal = DealContract;
    const market = MarketContract;
    const repToken = RepTokenContract;
    const token = TokenContract;
    const offerFactory = OfferFactoryContract;
    const dealFactory = DealFactoryContract;

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
        market,
        offerFactory,
        dealFactory,
        deal,
        token,
        repToken,
        signed
    };
}
