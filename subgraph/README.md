# To Deploy

1. Define networks RPCs `config.toml`.
2. Define contracts addresses in `networks.json`. This will be automatically used on build.
3. Generate WebAssembly `npm run subgraph:codegen`.
4. For each supported network build and deploy indexer. Run from monorepo root:
   1. `npx graph create sepolia -g http://localhost:8020`
   2. `npx graph deploy sepolia subgraph/subgraph.yaml --network sepolia -g http://localhost:8020 --ipfs http://localhost:5001 -l v0.0.1 --network-file subgraph/networks.json -o .cache/subgraph/build`.
