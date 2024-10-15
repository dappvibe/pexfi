import {createConfig, http} from 'wagmi'
import {arbitrumSepolia, hardhat} from 'wagmi/chains'

export const config = createConfig({
    chains: [arbitrumSepolia, hardhat],
    connectors: [
        // autodetected
    ],
    transports: {
        [arbitrumSepolia.id]: http(),
        [hardhat.id]: http("http://192.168.8.2:8545"),
    },
})

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}
