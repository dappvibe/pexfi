const currencies = require('./currencies.json');
const { ethers } = require('hardhat');
const contracts = require('./deployments/chain-421614/deployed_addresses.json');

async function updateRates() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        const json = await response.json();
        let rates = json.usd;
        for (let id in contracts) {
            let parts = id.split('#');
            if (parts[0] === 'PriceFeeds') {
                let currency = parts[1];
                let rate = rates[currency.toLowerCase()];
                if (rate) {
                    try {
                        const contract = await ethers.getContractAt('PriceFeed', contracts[id]);
                        let intrate = Math.round((1 / rate) * 10**8);
                        const tx = await contract.set(intrate);
                        const receipt = await tx.wait();
                        console.log(currency + ': ' + rate);
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    console.log('No rate for ' + currency);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

updateRates();
