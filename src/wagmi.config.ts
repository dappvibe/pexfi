import {createConfig, http, webSocket} from 'wagmi'
import {arbitrum, arbitrumSepolia, Chain, hardhat} from 'wagmi/chains'

let chains: [Chain, ...Chain[]];
switch (import.meta.env.MODE) {
    case 'staging':
        chains = [arbitrumSepolia]
        break
    case 'production':
        chains = [arbitrum, arbitrumSepolia]
        break
    default:
        chains = [hardhat, arbitrum, arbitrumSepolia]
}

/**
 * To allow reuse in useContract() when building ethers provider from Wagmi Client.
 */
export function getRpcUrl(chainId: number): string
{
    // to match allowed bigint
    chainId = Number(chainId);

    switch (chainId) {
        case 42161:
            return 'wss://arb-mainnet.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY
        case 421614:
            return 'wss://arb-sepolia.g.alchemy.com/v2/' + import.meta.env.VITE_ALCHEMY_KEY;
        default:
            return 'ws://localhost:8545';
    }
}

export const config = createConfig({
    chains: chains,
    connectors: [
        // autodetect
    ],
    transports: {
        [arbitrum.id]:          webSocket(getRpcUrl(arbitrum.id)),
        [arbitrumSepolia.id]:   webSocket(getRpcUrl(arbitrumSepolia.id)),
        [hardhat.id]:           webSocket(getRpcUrl(hardhat.id)),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
