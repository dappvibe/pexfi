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
                    contract.create(true, token, fiat, 'Zelle', 10000 + Math.floor(Math.random() * 500), [min = Math.floor(Math.random() * 1000) + 100, min + 10000], '');
                    contract.create(false, token, fiat, 'Zelle', 10000 + Math.floor(Math.random() * 500), [min = Math.floor(Math.random() * 1000) + 100, min + 10000], '');
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
})();
