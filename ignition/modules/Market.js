const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat");

const TokensModule = buildModule("Tokens", (m) => {
    // those are normally exist already in target network and need NOT be deployed
    const tokens = [];
    tokens['USDT'] = m.contract("MockERC20", ["USDT", 6], {id: "MockUSDT"}); // base for USD (must present)
    tokens['WBTC'] = m.contract("MockERC20", ["WBTC", 8], {id: "MockWBTC"});
    tokens['WETH'] = m.contract("MockERC20", ["WETH", 18], {id: "MockWETH"});

    return { tokens };
});

const UniswapModule = buildModule("Uniswap", (m) => {
    const { tokens } = m.useModule(TokensModule);

    // TODO use forked arbitrum mainnet
    const PoolBTC = m.contract('PoolBTC');
    const PoolETH = m.contract('PoolETH');
    const uniswap = m.contract('MockUniswapV3Factory');
    m.call(uniswap, "setPool", [tokens['WBTC'], PoolBTC], {id: "setPoolBTC"});
    m.call(uniswap, "setPool", [tokens['WETH'], PoolETH], {id: "setPoolETH"});

    return { uniswap };
});

const RepModule = buildModule("Rep", (m) => {
    const RepToken = m.contract('RepToken', []);
    m.call(RepToken, 'initialize');

    return { RepToken };
});

const PriceFeedsModule = buildModule("PriceFeeds", (m) => {
    // TODO provide chainlink price feeds
    const fiats = [];
    ['THB', 'RUB']
        .forEach((fiat, i) => {
            fiats.push([fiat, m.contract(`PriceFeed`, [fiat], {id: fiat})]);
        });
    // TODO find API to sync prices and upload to contracts

    return { fiats };
});

const InventoryModule = buildModule("Inventory", (m) => {
    const { uniswap } = m.useModule(UniswapModule);
    const { tokens } = m.useModule(TokensModule);
    const { fiats } = m.useModule(PriceFeedsModule);
    // TODO real list of methods
    const methods = [];
    methods.push({name: 'Zelle', group: 3});
    methods.push({name: 'SEPA', group: 3});

    const Inventory = m.contract('Inventory', [uniswap]);
    m.call(Inventory, 'addTokens', [tokens, 500]);
    m.call(Inventory, 'addFiats', [fiats]);
    m.call(Inventory, 'addMethods', [methods]);

    return { Inventory };
});

module.exports = buildModule("Market", (m) =>
{
    const { uniswapFactory } = m.useModule(UniswapModule);
    const { tokens } = m.useModule(TokensModule);
    const { RepToken } = m.useModule(RepModule);
    const { fiats } = m.useModule(PriceFeedsModule);
    const { Inventory } = m.useModule(InventoryModule);

    const market = m.contract("Market", []);

    const proxy = m.contract('ERC1967Proxy', [
        market,
        m.encodeFunctionCall(market, 'initialize', [RepToken, Inventory])
    ]);

    m.call(RepToken, 'grantRole', [hre.ethers.encodeBytes32String('MARKET_ROLE'), market]);

    return { market };
});
