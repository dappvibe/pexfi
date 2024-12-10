## How to run dev environment

1. Install hardhat and run local ETH node (EVM-emulator memory-only)
    * `sudo apt-get install npm`
    * `npm install`
    * `docker compose up -d hardhat`

2. Run blockscout
    * `cd blockscout && docker compose up -d`

3. Deploy tokens/currencies mocks to default local node
    * `npx hardhat run ignition/mocks.js > ignition/parameters/hardhat.json`

## Deploy

Use parameters file that holds uniswap, tokens, chainlink oracles addresses. For each network its own.
Use `--network` to select blockchain.

`npx hardhat ignition deploy ignition/modules/Market.js --parameters ignition/parameters/hardhat.json --verify --deployment-id hardhat`
