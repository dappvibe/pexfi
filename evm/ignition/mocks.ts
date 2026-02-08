import { network } from "hardhat";
import fs from 'fs';
import path from 'path';
import './modules/Market.ts';
import currencies from './currencies.json';

(async () => {
    const { ethers } = await network.connect();

    let Uniswap, PriceFeeds = {}, Tokens = {};

    const signers = await ethers.getSigners();
    // do not use the first signer, it is the deployer. so that real contracts have predictable addresses after mocks
    signers.shift();

    // create ERC20 tokens and credit to all test signers
    const TokenFactory = await ethers.getContractFactory("MockERC20", signers[0]);
    for (const token of [ ['WBTC', 8], ['WETH', 18], ['USDT', 6] ]) {
        const t = Tokens[token[0]] = await TokenFactory.deploy(...token);
        process.stderr.write('Deployed '+token[0]+'\n');
        for (const signer of signers) {
            await t.transfer(signer.address, BigInt(100000 * Math.pow(10, token[1])));
        }
    }

    // uniswap pools for mocks
    Uniswap = await ethers.deployContract('MockUniswapV3Factory', signers[0]);
    process.stderr.write('Deployed Uniswap\n');
    Uniswap.setPool(Tokens['WBTC'], await ethers.deployContract('PoolBTC'));
    Uniswap.setPool(Tokens['WETH'], await ethers.deployContract('PoolETH'));

    // price feeds. in production must pass chainlink address, for mocks set current market rate once
    let rates = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    rates = await rates.json();
    rates = rates.usd;
    const factory = await ethers.getContractFactory("PriceFeed", signers[0]);
    for (let currency of currencies) {
        const contract = PriceFeeds[currency.code] = await factory.deploy(currency.code);
        let rate = rates[currency.code.toLowerCase()];
        if (rate) {
            let intrate = Math.round((1 / rate) * 10**8);
            await contract.set(intrate);
            process.stderr.write(`USD to ${currency.code}: ${rate}\n`);
        }
    }

    // Market params
    let params = {
        uniswap: Uniswap.target,
        addTokens_0: Object.values(Tokens).map(t => t.target),
        addTokens_1: 500,
        fiats: [],
        methods: [
            ['National Bank', 0],
            ['SEPA', 0],
        ]
    };
    for (let fiat in PriceFeeds) {
        params.fiats.push([fiat, PriceFeeds[fiat].target]);
    }

    // Use this to deploy Market
    const outputPath = path.join(process.cwd(), 'evm', 'ignition', 'parameters', 'hardhat.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify({"Market": params}, null, 2));
    process.stderr.write('Done\n');
})();
