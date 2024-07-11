import deployed from '../../contracts/addresses.json';
import {abi as MarketAbi} from '../../contracts/artifacts/Market.json';
import {abi as RepTokenAbi} from '../../contracts/artifacts/RepToken.json';
import {abi as DealAbi} from '../../contracts/artifacts/Deal.json';
import {abi as OfferAbi} from '../../contracts/artifacts/Offer.json';
import {abi as OfferFactoryAbi} from '../../contracts/artifacts/OfferFactory.json';
import {abi as DealFactoryAbi} from '../../contracts/artifacts/DealFactory.json';
import {abi as ERC20Abi} from '../../contracts/artifacts/ERC20.json';
import {useChainId, useClient, useConnectorClient} from "wagmi";
import {BrowserProvider, ethers, FallbackProvider, JsonRpcProvider, JsonRpcSigner} from "ethers";
import {useMemo} from "react";

export function useContract()
{
    const chainId = useChainId();
    const client = useClient({chainId});

    function clientToProvider(client) {
        const { chain, transport } = client
        const network = {
            chainId: chain.id,
            name: chain.name,
            ensAddress: chain.contracts?.ensRegistry?.address,
        }
        if (transport.type === 'fallback') {
            const providers = (transport.transports).map(
                ({ value }) => new JsonRpcProvider(value?.url, network),
            )
            if (providers.length === 1) return providers[0]
            return new FallbackProvider(providers)
        }
        return new JsonRpcProvider(transport.url, network)
    }
    useMemo(() => (client ? clientToProvider(client) : undefined), [client])

    function clientToSigner(client) {
        const { account, chain, transport } = client
        const network = {
            chainId: chain.id,
            name: chain.name,
            ensAddress: chain.contracts?.ensRegistry?.address,
        }
        const provider = new BrowserProvider(transport, network)
        return new JsonRpcSigner(provider, account.address)
    }
    const { data: connector } = useConnectorClient({ chainId })
    useMemo(() => (connector ? clientToSigner(connector) : undefined), [connector]);

    const addresses = deployed[chainId];
    const provider = clientToProvider(client);

    const signed = async (contract) => {
        const signer = clientToSigner(connector);
        return contract.connect(signer);
    };

    const Market = new ethers.Contract(addresses['Market#Market'], MarketAbi, provider);
    const OfferFactory = new ethers.Contract(addresses['OfferFactory#OfferFactory'], OfferFactoryAbi, provider);
    const DealFactory = new ethers.Contract(addresses['DealFactory#DealFactory'], DealFactoryAbi, provider);
    const RepToken = new ethers.Contract(addresses['RepToken#RepToken'], RepTokenAbi, provider);
    const Deal = new ethers.Contract('0x', DealAbi, provider);
    const Offer = new ethers.Contract('0x', OfferAbi, provider);
    const Token = new ethers.Contract('0x', ERC20Abi, provider);

    return {
        signed,
        Market,
        OfferFactory,
        DealFactory,
        RepToken,
        Deal,
        Offer,
        Token
    };
}
