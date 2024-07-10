import {createConfig, http} from 'wagmi'
import {arbitrumSepolia, hardhat} from 'wagmi/chains'

export const config = createConfig({
    chains: [arbitrumSepolia, hardhat],
    transports: {
        [arbitrumSepolia.id]: http(),
        [hardhat.id]: http(),
    },
})
