---
name: subgraph-ops
description: Expert guidance for developing, debugging, and maintaining subgraphs. Use for AssemblyScript compilation errors, schema/mapping updates, and troubleshooting local indexing issues (reindexing, address verification) using project-specific tools.
---

# Subgraph Operations & Indexing

This skill provides specialized workflows for working with Subgraphs in this project, focusing on the local development environment (Docker + Hardhat).

## Core Workflows

### 1. Synchronizing Types
Always run codegen after modifying `schema.graphql` or `subgraph.yaml` to ensure TypeScript types and entity definitions are in sync.
```bash
npm run subgraph:codegen
```

### 2. Forced Reindexing
**CRITICAL:** NEVER run `docker compose down -v`. This will wipe all persistent volumes, including the EVM state and Blockscout database, which are difficult to restore.

To force the subgraph to reindex after a change:
- **Preferred Method**: Deploy a new version with an incremented label (e.g., `-l v0.0.2`, `v0.0.3`). The Graph node will automatically start indexing the new version from the specified `startBlock`.
- **Manual Reset**: If you must remove a specific subgraph to start over without affecting other services, use the `graph remove` command:
  ```bash
  npx graph remove hardhat --node http://localhost:8020
  ```

### 3. Deploying Updates
To deploy a new version of the mapping:
1. Increment the version label (`-l v0.0.x`).
2. Ensure the subgraph is created on the node first (if it's a new name).

```bash
# Create (only once per name)
npx graph create --node http://localhost:8020 hardhat

# Deploy
npx graph deploy hardhat subgraph/subgraph.yaml \
  --network hardhat \
  --node http://localhost:8020 \
  --ipfs http://localhost:5001 \
  -l v0.0.x \
  --network-file subgraph/networks.json \
  --skip-migrations
```

## Troubleshooting & Best Practices

### Verifying Deployment Addresses
If indexing produces no results, verify that `subgraph/networks.json` and `subgraph/subgraph.yaml` match the actual deployed address on the local network.
- **Tool**: Check `evm/deployments/chain-31337/deployed_addresses.json` or the ignition journal `./evm/deployments/chain-31337/journal.jsonl` for the real contract addresses and their deployment `blockNumber`.

### AssemblyScript Compilation Errors
Common fixes for the restricted AssemblyScript environment:
- **Type Conversions**: Use `.toI32()` to convert `BigInt` (from ABIs) to `Int` (in GraphQL).
- **Bitwise Operations**: Standard operators (`&`, `|`) do not work for `BigInt`. Use `.bitAnd()`, `.bitOr()`, `.leftShift()`, etc.
- **Hex to String**: Solidity `bytesN` types often come as null-padded hex. Use a helper to clean them:
  ```typescript
  function bytesToString(bytes: Bytes): string {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) break;
      str += String.fromCharCode(bytes[i]);
    }
    return str;
  }
  ```

### Validation
Always validate your changes by querying the subgraph node directly or via a script using the project's Apollo client configuration (`src/Providers.tsx` and `src/subgraph.config.ts`).
