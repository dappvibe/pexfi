---
name: hardhat-tester
description: Solidity contracts testing guides using Hardhat3. This skill should be used when writing, reviewing or refactoring unit tests to run against deployed contracts in local in-memory hardhat instance or blockchain deployments.
---

# When to Apply

Reference these guidelines when:
- Writing unit tests to check Solidity contracts functionality
- Creating or changing Solidity contracts that requires testing

# Architectural guidelines

You MUST use latest hardhat v3 with TypeScript, viem and 'node:test' engine.

To deploy initial state of blockchain and contracts you MUST use ignition modules.
If you need fixtures check for existing ignition modules that may provide mocks or initial values. You are required to load ignition module directly in tests.
Goal is to replicate blockchain state as if was deployed with ignition to a live blockchain.

# Running tests

`npx hardhat test`

# Using network in Hardhat 3

Hardhat 3 creates multiple networks which is very different from hardhat 2.
Tools are no longer exported from hardhat module, but from connected module.

Correct usage:
```
import { network } from "hardhat";
const { ignition, viem, networkHelpers } = await network.connect();
```

# Accounts

Hardhat has pre-defined 20 accounts accessible with:
```
import { network } from "hardhat";
const { ignition, viem, networkHelpers } = await network.connect();
const clients = await viem.getWalletClients()
const deployer = clients[0]
```

For simple single account tests default is account indexed at 0.

# Blockchain state snapshots

To improve tests performance you SHOULD use snapshots of a clear blockchain state instead of deploying each time.

Example:
```
const { networkHelpers } = await hre.network.connect();
const snapshot = await networkHelpers.takeSnapshot();
await snapshot.restore(); // Restores the blockchain state
```

## Fixtures

The loadFixture function is useful in tests where you need to set up the blockchain to a desired state (like deploying contracts, minting tokens, etc.) and then run multiple tests based on that state.

It executes the given fixture function, which should set up the blockchain state, and takes a snapshot of the blockchain. On subsequent calls to loadFixture with the same fixture function, the blockchain is restored to that snapshot rather than executing the fixture function again.

The fixture function receives the connection object as its only argument, allowing you to interact with the network.

Do not pass anonymous functions as the fixture function. Passing an anonymous function like loadFixture(async () => { ... }) will bypass the snapshot mechanism and result in the fixture being executed each time. Instead, always pass a named function, like loadFixture(deployTokens).

```
type Fixture<T> = (connection: NetworkConnection) => Promise<T>;
loadFixture(fixture: Fixture<T>): Promise<T>
// fixture: A named asynchronous function that sets up the desired blockchain state and returns the fixture’s data.
```

Example:
```
async function setupContracts({ viem }: NetworkConnection) {
  const contractA = await viem.deployContract("ContractA");
  const contractB = await viem.deployContract("ContractB");
  return { contractA, contractB };
}
const { contractA, contractB } = await loadFixture(setupContracts);
```

# Viem Assertions

Correct:
```
import { describe, it } from "node:test";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.connect();

describe("Counter", function () {
  it("Should emit the Increment event when calling the inc() function", async function () {
    const counter = await viem.deployContract("Counter");

    await viem.assertions.emitWithArgs(
      counter.write.inc(),
      counter,
      "Increment",
      [1n],
    );
  });

  it("Should allow the owner to increment and revert for non-owners", async function () {
    const counter = await viem.deployContract("Counter");

    const nonOwnerAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    // Impersonate the non-owner account
    await networkHelpers.impersonateAccount(nonOwnerAddress);

    // Fund the non-owner account with some ETH to pay for gas
    await networkHelpers.setBalance(nonOwnerAddress, 10n ** 18n);

    // Call inc() as the owner - should succeed
    await viem.assertions.emitWithArgs(
      counter.write.inc(),
      counter,
      "Increment",
      [1n],
    );

    // Call inc() as a non-owner - should revert
    await viem.assertions.revertWith(
      counter.write.inc({ account: nonOwnerAddress }),
      "only the owner can increment the counter",
    );
  });
});
```

# Gas Stats

When solving tasks for optimization and gas savings use `--gas-stats` option for test runner to compare results.
