import {createConfig, http, webSocket} from 'wagmi'
import {arbitrum, arbitrumSepolia, Chain, hardhat} from 'wagmi/chains'

let chains: [Chain, ...Chain[]];
switch (import.meta.env.MODE) {
    case 'staging':
        chains = [arbitrumSepolia]
        break
    case 'production':
        chains = [arbitrum]
        break
    default:
        chains = [hardhat]
}

export const config = createConfig({
    chains: chains,
    connectors: [
        // autodetected
    ],
    transports: {
        [arbitrumSepolia.id]: http(),
        [hardhat.id]: webSocket('ws://127.0.0.1:8545/'),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
