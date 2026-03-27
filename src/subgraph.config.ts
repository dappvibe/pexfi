import { mainnet, sepolia, hardhat } from 'wagmi/chains'

export const SUBGRAPH_URLS: Record<number, string> = {
  [mainnet.id]: 'https://api.studio.thegraph.com/query/1745305/mainnet/version/latest',
  [sepolia.id]: 'https://api.studio.thegraph.com/query/1741439/sepolia/version/latest',
  [hardhat.id]: 'http://localhost:8000/subgraphs/name/hardhat',
}
