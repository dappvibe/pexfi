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
        [
            [true, 'WBTC', 'USD', 'Zelle', 10250, 1000, 5000, ''],
            [true, 'WBTC', 'THB', 'Zelle', 10400, 100,  1000, ''],
            [true, 'WETH', 'EUR', 'SEPA',  10250, 1000, 5000, ''],
            [true, 'USDT', 'USD', 'Zelle', 10250, 1000, 5000, 'arbitrary terms'],
            [false, 'WBTC', 'USD', 'Zelle', 9800, 1000, 5000, ''],
            [false, 'WBTC', 'RUB', 'Zelle', 9650, 100,  1000, ''],
            [false, 'WETH', 'EUR', 'SEPA',  9750, 1000, 5000, ''],
            [false, 'USDT', 'USD', 'Zelle', 9950, 1000, 5000, ''],
        ].forEach((offer) => {
            contract.createOffer([...offer]).then(tx => tx.wait().then(receipt => console.log(receipt)));
        });
    } catch (error) {
        console.error(error);
    }
}

main();
