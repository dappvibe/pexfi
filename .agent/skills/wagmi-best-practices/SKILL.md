---
name: wagmi-best-practices
description: General guidelines and best practices for writing robust, type-safe Web3 React code using Wagmi, Viem, and React Query. Use when writing, reviewing, or refactoring components and hooks that interact with EVM blockchains.
---

# Wagmi & Viem Best Practices

When building React applications interacting with EVM blockchains, `wagmi` and `viem` are the standard tools. To ensure robust performance, user experience, and type safety, adhere to the following best practices across any project.

## 1. Typing & Data Structures

- **Use `viem` primitive types:** Always rely on `Address`, `Hex`, and `ByteArray` from `viem`. Avoid inline literal types like `` `0x${string}` `` or generic `string` for blockchain identifiers.
- **Strict ABIs:** Always define ABIs `as const` or import them from strongly typed sources. This allows TS to infer contract function names, input parameters, and return types correctly.
- **No `any`:** Do not circumvent the Wagmi type-checker using `as any`. If a hook like `useWriteContract` throws a TypeScript error, fix the underlying variables or your ABI definition.

## 2. React Query Integration

Wagmi hooks (like `useReadContract` and `useAccount`) are built on top of TanStack React Query.
- **Use the `query` object:** Most Wagmi hooks accept a `query` property. Use this to pass React Query options like `enabled`, `staleTime`, `refetchInterval`, and `select`.
- **Conditional Fetching:** Use `query: { enabled: !!address && !!chainId }` to prevent contract reads from firing prematurely when dependency arguments (like user addresses) are `undefined` or null.
- **Data Transformation:** Use the `select` function inside the `query` config to cleanly format data (e.g., parsing BigInts to standard numbers or scaling decimals) immediately when the data lands, avoiding messy effect-based transformations in components.

## 3. Optimizing Contract Reads

- **Batching:** If you need to read multiple distinct methods from the same contract or multiple contracts at once, ALWAYS use `useReadContracts` instead of stacking multiple `useReadContract` hooks. This batches JSON-RPC calls, drastically improving performance and preventing rate limits.
- **Caching:** Set reasonable `staleTime` limits for read queries if the data doesn't change on every block, to reduce unnecessary RPC requests.
- **Event Watching:** For data that updates on-chain unpredictably, consider using `useWatchContractEvent` to listen to specific events and strategically call `refetch()` on affected queries.

## 4. Writing Contracts & Transactions

Transactions in Wagmi generally require a three-step UX process:
1. **Prepare/Simulate:** Use `useSimulateContract` to execute a dry run of the transaction. This verifies inputs and catches contract reverts early rather than making the user pay gas to fail.
2. **Execute:** Pass the `.request` object from the simulation to `useWriteContract`'s `writeContractAsync` method.
3. **Wait for Receipt:** Take the transaction `hash` and feed it into `useWaitForTransactionReceipt`. Always show the user loading states specifically tied to the transaction receipt resolving, not just the wallet signature resolving.

## 5. Error Handling

- **Catch Errors Early:** Handle and display errors properly to the user. Wagmi maps typical EVM exceptions.
- **Destructure Short Messages:** When catching an error from `writeContractAsync`, it might be an EVM revert, a wallet rejection, or a network failure. Use `error.shortMessage || error.message` to find the cleanest user-facing string.

## Exclusivity

- **Use ONLY Viem/Wagmi utilities:** Never import `ethers.js` or `web3.js` formatting or hashing utilities.
- For conversions: `parseUnits`, `formatUnits`, `parseEther`, and `formatEther` all live in `viem`.

## 6. Migration to Wagmi v3 (Important Hooks)

When working on or refactoring code, enforce Wagmi v3 naming conventions:
- **`useAccount` is deprecated.** Replace it with `useConnection`.
- **`useAccountEffect` is deprecated.** Replace it with `useConnectionEffect`.
- **`useSwitchAccount` is deprecated.** Replace it with `useSwitchConnection`.
- **Destructuring `useWriteContract`:** The returned write function should be destructured as `mutate` or `mutateAsync` instead of the old `writeContract`/`writeContractAsync`. Example: `const { mutateAsync } = useWriteContract()`.
- Do not use `useConnect().connectors` or `useDisconnect().connectors`; use `useConnectors` and `useConnections` respectively.
