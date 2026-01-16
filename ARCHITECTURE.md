# High-Level Flow

```ascii
     User Action
          │
          ▼
  +----------------+                                  +------------------+
  |    Frontend    |   Write (Wagmi/Viem)            |                  |
  |     (src/)     | ------------------------------> |   EVM Contracts  |
  | React / Vite   |                                 |      (evm/)      |
  +-------+--------+                                 +--------+---------+
          │                                                   │
          │ Read (Apollo/GraphQL)                             │ Emits Events
          │                                                   ▼
  +-------+--------+                                 +------------------+
  |    Subgraph    | <------------------------------ |    The Graph     |
  |  (subgraph/)   |          Indexing               |      Node        |
  +----------------+                                 +------------------+
```
