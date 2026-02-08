import { mainnet, sepolia, hardhat } from 'wagmi/chains'

export const SUBGRAPH_URLS: Record<number, string> = {
  [mainnet.id]: 'https://api.studio.thegraph.com/query/1741439/pexfi/v0.0.1',
  [sepolia.id]: 'https://api.studio.thegraph.com/query/1741439/pexfi/v0.0.1',
  [hardhat.id]: 'http://localhost:8000/subgraphs/name/sov',
}
