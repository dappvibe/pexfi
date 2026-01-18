# Code Architecture Summary

The **pexfi** project is a decentralized peer-to-peer exchange platform for ERC20 tokens and fiat currency. The architecture is composed of three main layers:

## 1. Smart Contracts (EVM)
Located in the `evm/` directory, this layer contains the core business logic deployed on EVM-compatible blockchains.
- **Framework**: Hardhat
- **Key Contracts**:
  - `Market.sol`: Central entry point for the protocol.
  - `Offer.sol` / `OfferFactory.sol`: Manages buy/sell offers.
  - `Deal.sol` / `DealFactory.sol`: Handles active trades and escrow.
  - `RepToken.sol`: Implements the reputation system (NFT).
  - `PriceFeed.sol`: Integrates with Chainlink for price data.

## 2. Frontend
Located in the `src/` directory, this is the client-facing React application.
- **Framework**: React with Vite
- **Blockchain Interaction**: Uses `wagmi` and `viem` for writing to contracts (sending transactions).
- **Data Fetching**: Queries the Subgraph via Apollo/GraphQL for reading indexed data.

## 3. Subgraph
Located in the `subgraph/` directory, this layer indexes on-chain events to provide efficient data querying for the frontend.
- **Framework**: The Graph
- **Function**: Listens to events emitted by the smart contracts (e.g., offer creation, deal updates) and maps them to a GraphQL schema.

## Interaction Flow
1. **User Actions**: The frontend initiates transactions using Wagmi.
2. **On-Chain Logic**: Smart contracts execute the logic and emit events.
3. **Indexing**: The Graph Node captures these events and updates the Subgraph.
4. **Data Retrieval**: The frontend queries the Subgraph to display updated state to the user.
