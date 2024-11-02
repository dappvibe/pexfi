import {createConfig, http, webSocket} from 'wagmi'
import {arbitrumSepolia, hardhat} from 'wagmi/chains'

export const config = createConfig({
    chains: [arbitrumSepolia, hardhat],
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
