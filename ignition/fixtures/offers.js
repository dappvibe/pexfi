const { ethers } = require('hardhat');

async function main() {
    const signers = await ethers.getSigners();

    const contracts = require('../deployments/chain-31337/deployed_addresses.json');
    const contract = await ethers.getContractAt(
        'Market',
        contracts['Market#ERC1967Proxy']
    );

    await contract.connect(signers[1]);

    try {
        const tokens = ['WBTC', 'WETH', 'USDT'];
        const fiats = ['USD', 'EUR', 'THB', 'RUB', 'CNY', 'GBP'];

        tokens.forEach(token => {
            fiats.forEach(fiat => {
                let min = 0;
                for (let i = 0; i < 10; i++){
                    contract.createOffer([true, token, fiat, 'Zelle', 10000 + Math.floor(Math.random() * 500), min = Math.floor(Math.random() * 1000) + 100, min + 100, '']);
                    contract.createOffer([false, token, fiat, 'Zelle', 10000 + Math.floor(Math.random() * 500), min = Math.floor(Math.random() * 1000) + 100, min + 100, '']);
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}

main();
