const {ethers, ignition} = require("hardhat");
const MarketModule = require('./modules/Market');

let Uniswap, PriceFeeds = {}, Tokens = {};

async function deploy()
{
    // ERC20 tokens (mocks)
    const TokenFactory = await ethers.getContractFactory("MockERC20");
    for (const token of [ ['WBTC', 8], ['WETH', 18], ['USDT', 6] ]) {
        const t = Tokens[token[0]] = await TokenFactory.deploy(...token);
        const signers = await ethers.getSigners();
        for (const signer of signers) {
            await t.transfer(signer.address, BigInt(100000 * Math.pow(10, token[1])));
        }
    }

    // uniswap pools (mocks)
    Uniswap = await ethers.deployContract('MockUniswapV3Factory');
    Uniswap.setPool(Tokens['WBTC'], await ethers.deployContract('PoolBTC'));
    Uniswap.setPool(Tokens['WETH'], await ethers.deployContract('PoolETH'));

    // price feeds
    let rates = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    rates = await rates.json();
    rates = rates.usd;
    const currencies = require('./currencies.json');
    const factory = await ethers.getContractFactory("PriceFeed");
    for (let currency of currencies) {
        //if (currency.chainlink) return; // in production must pass chainlink address
        const contract = PriceFeeds[currency.code] = await factory.deploy(currency.code);
        let rate = rates[currency.code.toLowerCase()];
        if (rate) {
            let intrate = Math.round((1 / rate) * 10**8);
            await contract.set(intrate);
            console.log(currency.code + ': ' + rate);
        }
        else console.log('No rate for ' + currency.code);
    }

    // Market
    let params = {
        uniswap: Uniswap.target,
        addTokens_0: Object.values(Tokens).map(t => t.target),
        addTokens_1: 500,
        fiats: [],
        methods: [
            ['Zelle', 0],
            ['SEPA', 0],
        ]
    };
    for (let fiat in PriceFeeds) {
        params.fiats.push([fiat, PriceFeeds[fiat].target]);
    }

    await ignition.deploy(MarketModule, {parameters: { Market: params }});
}
return deploy();
