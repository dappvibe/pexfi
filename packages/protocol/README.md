# EVM contracts for PEXFI

Ethereum backend: the core of the platform.

## How to run a dev environment

1. Install hardhat and run the local ETH node (EVM-emulator memory-only)
    * `sudo apt-get install npm`
    * `npm install`
    * `docker compose up -d hardhat`

2. Deploy tokens/currencies mocks to default local node
    * `npx hardhat run ignition/mocks.js --network localhost > ignition/parameters/hardhat.json`

NOTE: dotenv lib writes "tips" there. Remove manually from the generated JSON.

## Deploy

Use parameters file that holds uniswap, tokens, chainlink oracles addresses. For each network its own.
Use `--network` to select blockchain. Networks are in ignition/parameters/

```shell
npx hardhat ignition deploy ignition/modules/Market.js \
    --parameters ignition/parameters/hardhat.json \
    --deployment-id hardhat \
    --network localhost \
    --verify
```

## Browsing local blockchain
   ```shell
    git clone https://github.com/pexfi-com/blockscout
    cd blockscout && docker compose up -d
   ```
   And then to let blockscout show names and ABI's in tihs repo's root
   `npx hardhat ignition verify hardhat --network localhost --include-unrelated-contracts`
