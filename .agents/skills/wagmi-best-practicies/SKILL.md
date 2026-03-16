---
name: wagmi-best-practicies
description: Guidelines for migrating and using Wagmi v3. Use when updating or writing wagmi hooks like useConnection, useWriteContract, etc.
allowed-tools: Read, Write, Edit, Glob, Grep
model: opus
license: MIT
metadata:
  author: pexfi
  version: '1.0.0'
---

# Wagmi v3 Best Practices and Migration Guidelines

- `useAccount` is deprecated. Use `useConnection` instead.
- `useAccountEffect` is deprecated. Use `useConnectionEffect` instead.
- `useSwitchAccount` is deprecated. Use `useSwitchConnection` instead.

- The hooks `useWriteContract` and others that previously returned `writeContract` and `writeContractAsync` have been updated.
- `writeContract` is renamed to `mutate`.
- `writeContractAsync` is renamed to `mutateAsync`.

- Do not use `useConnect().connectors` or `useReconnect().connectors`. Use `useConnectors` instead.
- Do not use `useDisconnect().connectors` or `useSwitchConnection().connectors`. Use `useConnections` instead.
- Do not use `useSwitchChain().chains`. Use `useChains` instead.

- Note: Ensure to only update `wagmi` hooks and their return values. E.g. `walletClient.writeContract` in `viem` tests is not affected by this change.
