## How to run dev environment
    * `apt-get install npm`
    * `npm install`
    * `docker compose up -d`

Optionally run blockscout
    * `cd blockscout && docker compose up -d`

## Deploy

`npx hardhat ignition ignition/modules/Market.js --network localhost --verify`
