# Codebase Architecture Summary

This document provides a technical overview of the **pexfi** architecture, spanning the EVM protocol, Frontend, and Indexing layers.

## 1. Protocol Layer (EVM)
The core logic resides in `evm/`, built with Hardhat. It implements a non-custodial peer-to-peer exchange using a factory-based architecture.

*   **Architecture Pattern**: A central `Market` contract acts as the protocol entry point, registry, and access controller.
*   **Factory Model**:
    *   **Isolation**: Uses `OfferFactory` and `DealFactory` to deploy separate contracts for each `Offer` (maker advertisement) and `Deal` (active trade).
    *   **Security**: Each trade has its own escrow contract (`Deal`), isolating risk.
*   **Storage Strategy**: To bypass contract size limits (Spurious Dragon), the `Market` contract delegates storage logic to internal libraries (`Deals`, `Offers`, `Tokens`, `Fiats`, `Methods`).
*   **Upgradeability**: The system uses the **UUPS (Universal Upgradeable Proxy Standard)** pattern for the `Market` contract.
*   **Price Feeds**: Integrates with Chainlink for major currencies and uses a custom `PriceFeed` contract for assets not supported by Chainlink.
*   **Reputation**: `RepToken` is a Soulbound Token (SBT) used to track user reputation and mediator standing.

## 2. Interface Layer (Frontend)
The client application in `src/` is a Single Page Application (SPA) built for performance and direct blockchain interaction.

*   **Stack**: React, Vite, TypeScript.
*   **Web3 Integration**:
    *   **Wagmi / Viem**: Handles wallet connection, message signing, and transaction lifecycle.
    *   **Contract Interaction**: Writes are executed directly against the contracts via RPC.
*   **Data Strategy**:
    *   **Indexing**: Uses Apollo Client to query The Graph for aggregated data (e.g., "List all Sell offers").
    *   **Real-time**: Critical state (e.g., User Balance, Allowance) is fetched directly from the blockchain to ensure 100% accuracy during trade execution.

## 3. Indexing Layer (Subgraph)
Located in `subgraph/`, this layer ensures efficient data retrieval for the frontend.

*   **Dynamic Data Sources**: The subgraph uses **Data Source Templates** (`Offer`, `Deal`) to dynamically instantiate indexers for new contracts as they are created by the factories.
*   **Event Handling**:
    *   `Market`: Listens for `OfferCreated` and `DealCreated`.
    *   `Offer`: Tracks updates to offer parameters.
    *   `Deal`: Tracks state changes (`Accepted`, `Completed`, `Disputed`) and chat messages (`Message`, `FeedbackGiven`).
*   **Entities**: Maps on-chain events to rich GraphQL entities (`Offer`, `Deal`, `Profile`) for easy filtering and sorting in the UI.
