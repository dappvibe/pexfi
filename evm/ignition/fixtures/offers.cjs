const { ethers } = require('hardhat');

(async () => {
    const signers = await ethers.getSigners();

    const contracts = require('../deployments/chain-31337/deployed_addresses.json');
    let contract = await ethers.getContractAt(
        'OfferFactory',
        contracts['OfferFactory#OfferFactory']
    );

    try {
        const tokens = ['WBTC', 'WETH', 'USDT'];
        const fiats = ['USD', 'EUR'];

        tokens.forEach(token => {
            fiats.forEach(fiat => {
                let min = 0;
                for (let i = 0; i < 10; i++){
                    contract = contract.connect(signers[Math.floor(Math.random() * signers.length)]);
                    contract.create({
                        isSell: true,
                        token: token,
                        fiat: fiat,
                        method: 'National Bank',
                        rate: 10000 + Math.floor(Math.random() * 500),
                        limits: { min: min = Math.floor(Math.random() * 1000) + 100, max: min + 10000 },
                        terms: ''
                    });
                    contract.create({
                        isSell: false,
                        token: token,
                        fiat: fiat,
                        method: 'National Bank',
                        rate: 10000 + Math.floor(Math.random() * 500),
                        limits: { min: min = Math.floor(Math.random() * 1000) + 100, max: min + 10000 },
                        terms: ''
                    });
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
})();
