# Security Audit Report

## Executive Summary

This report details the findings of a security audit performed on the `evm/protocol` contracts. The audit focused on overflow safety, access control, data integrity, and injection risks.

**Critical vulnerabilities were identified in `FeeCollector.sol`**, primarily related to slippage protection and permissionless access.
Other findings include potential overflow issues in `Profile.sol` (though likely unused), frontrunning/griefing risks in `Market.sol`, and minor logic concerns in helper libraries.

## 1. Critical Vulnerabilities

### 1.1 `FeeCollector.sol`: Sandwich Attack Vulnerability (Zero Slippage)

**Description:**
The `buyback` function in `FeeCollector.sol` executes token swaps using `UniversalRouter` via `_swapTokenToPexfi` and `_swapEthToPexfi`. In both functions, the `amountOutMinimum` parameter for the swap is hardcoded to `0`.

```solidity
        ExactInputSingleParams memory swapParams1 = ExactInputSingleParams({
            poolKey: tokenPoolKey,
            zeroForOne: zeroForOne,
            amountIn: uint128(amountIn),
            amountOutMinimum: 0, // CRITICAL: No slippage protection
            hookData: ""
        });
```

**Impact:**
An attacker can sandwich the `buyback` transaction by frontrunning it to manipulate the pool price (making PEXFI expensive) and backrunning it to profit. This can result in significant loss of value for the protocol, as the `FeeCollector` will receive far fewer PEXFI tokens than expected.

**Recommendation:**
Implement slippage protection. The `buyback` function should accept a `minAmountOut` parameter, or use an on-chain oracle (e.g., TWAP) to verify the price is within an acceptable range.

### 1.2 `FeeCollector.sol`: Permissionless Arbitrary Execution Risk

**Description:**
The `buyback` function is `external` and can be called by anyone. It accepts a `fee` parameter which is used to construct the `PoolKey` for the swap.

```solidity
    function buyback(address token, uint24 fee) external payable {
        // ...
        _swapTokenToPexfi(token, fee);
        // ...
    }
```

**Impact:**
A malicious actor can call `buyback` with a `fee` tier that corresponds to a pool with low liquidity or one that they control. They can then exploit the zero slippage vulnerability described above to extract value from the `FeeCollector`'s token balance. Additionally, they can trigger swaps at inopportune times or with inefficient routes.

**Recommendation:**
Restrict `buyback` to trusted roles (e.g., `onlyOwner` or a dedicated `KEEPER_ROLE`). Alternatively, validate the `fee` tier against a whitelist or ensure the pool has sufficient liquidity.

## 2. High/Medium Findings

### 2.1 `Profile.sol`: Potential Integer Overflow in `statsVolumeUSD`

**Description:**
The `statsVolumeUSD` function updates the `volumeUSD` field, which is a `uint32`.

```solidity
    function statsVolumeUSD(uint tokenId_, uint32 _volumeUSD) onlyRole(DEAL_ROLE) external
    {
        unchecked { stats[tokenId_].volumeUSD += _volumeUSD; }
    }
```

**Impact:**
If `volumeUSD` tracks value in standard fiat decimals (e.g., 6 decimals for USD), `uint32` max value (~4.29 billion) corresponds to only ~$4,294. Any volume accumulation beyond this will overflow silently due to the `unchecked` block.
*Note: This function appears to be unused in the current codebase (`Deal.sol` does not call it), mitigating the immediate risk.*

**Recommendation:**
Change `volumeUSD` to `uint256` or `uint128`. If the function is dead code, remove it.

## 3. Low / Informational Findings

### 3.1 `Market.sol`: Frontrunning / Griefing Risk in `fundDeal`

**Description:**
A comment in `Market.sol` highlights a potential issue:
`// FIXME critical security flaw! buyer can't cancel after deal is accepted`
Analysis shows that if a Seller submits a `fundDeal` transaction, the Buyer (if they are the offer owner) can frontrun this with a `cancel` transaction. This causes the Seller's `fundDeal` to revert (state becomes `Canceled`).

**Impact:**
This is a griefing vector. The Seller pays gas for a failed transaction, but funds are not lost. If the Buyer cancels *after* funding (if allowed), funds are returned to the Seller. The risk is low but can degrade user experience.

**Recommendation:**
Consider implementing a "locking" mechanism or a delay before cancellation is allowed after acceptance, or require a deposit from the Buyer.

### 3.2 `Tokens.sol` / `Fiats.sol`: Symbol Collision

**Description:**
The `Tokens` and `Fiats` libraries truncate symbols to `bytes8` and `bytes3` respectively.
`bytes8 key = bytes8(bytes(api.symbol()));`

**Impact:**
If two tokens share the same first 8 characters, adding the second one will overwrite the first one in the mapping. Since `addTokens` is `onlyOwner`, this is an administrative risk.

**Recommendation:**
Check if the key already exists before overwriting, or use the full address as the key in the mapping (though `bytes8` is likely used for gas optimization/compact storage).

### 3.3 `PriceFeed.sol`: Centralization Risk

**Description:**
`PriceFeed.sol` relies on `onlyOwner` to update rates.

**Impact:**
If the owner key is compromised, the oracle can be manipulated, affecting all conversions in `Market.sol`.

**Recommendation:**
Use a multi-sig or a decentralized oracle network where possible. Ensure strict key management for the owner account.

### 3.4 `Deal.sol`: Initialization Vulnerability (Mitigated)

**Description:**
`Deal.sol` contracts are cloned. The `initialize` function is `external`.

**Impact:**
An attacker could theoretically initialize a cloned contract before the legitimate creator does. However, `Offer.createDeal` creates and initializes the clone in the same transaction, making frontrunning impossible unless the attacker can predict the address of the next clone and initialize it separately (which `Clones` library handles safely). The `Initializable` contract protects against re-initialization.
**Status: Mitigated.**

## 4. Conclusion

The `evm/protocol` codebase is generally well-structured but contains **critical vulnerabilities in the `FeeCollector` contract** regarding slippage protection and permissionless execution. These should be addressed immediately before deployment. The other findings are lower severity or informational but should be considered for future improvements.
