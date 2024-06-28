const currencies = require('./currencies.json');
const { ethers } = require('hardhat');

const contracts = require('./deployments/chain-31337/deployed_addresses.json');

// https://github.com/fawazahmed0/exchange-api?tab=readme-ov-file
fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json').then(res => {
    const json = res.json().then(rates => {
        rates = rates.usd;
        for (let id in contracts) {
            let parts = id.split('#');
            if (parts[0] === 'PriceFeeds') {
                let currency = parts[1];
                let rate = rates[currency.toLowerCase()];
                if (rate) {
                    ethers.getContractAt('PriceFeed', contracts[id]).then(contract => {
                        let intrate = Math.round((1 / rate) * 10**8);
                        contract.set(intrate).then((tx) => {
                            tx.wait().then(receipt => {
                                console.log(currency + ': ' + rate);
                            });
                        }).catch(console.error);
                    }).catch(console.error);
                }
                else console.log('No rate for ' + currency);
            }
        }
    });
});
