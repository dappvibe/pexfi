const {ethers} = require("hardhat");
const {deployMockERC20} = require("./mocks");
const {expect} = require("chai");

let Inventory, PriceFeed,
    MockUniswap, PoolBTC, PoolETH,
    MockETH, MockBTC, MockUSDT;

before(async function() {
    [deployer, seller, buyer, mediator] = await ethers.getSigners();
    MockBTC = await deployMockERC20('WBTC', 8);
    MockETH =  await deployMockERC20('WETH', 18);
    MockUSDT = await deployMockERC20('USDT', 6);
    const PoolBTC = await ethers.deployContract('PoolBTC');
    const PoolETH = await ethers.deployContract('PoolETH');
    MockUniswap = await ethers.deployContract('MockUniswapV3Factory');
    MockUniswap.setPool(MockBTC.target, PoolBTC.target);
    MockUniswap.setPool(MockETH.target, PoolETH.target);
    Inventory = await ethers.deployContract('Inventory', [MockUniswap.target]);
});

describe('Deploy', function()
{
    it (`EUR is deployed`, async function() {
        await ethers.deployContract('PriceFeed', ['EUR'])
            .then((feed) => PriceFeed = feed);
        await PriceFeed.set(106927500);
        const data = await PriceFeed.latestRoundData();
        expect(data[1]).to.eq(106927500);
    });

    it ('add supported tokens', async function() {
        await expect(Inventory.addTokens([MockBTC.target, MockETH.target, MockUSDT.target]))
            .to.emit(Inventory, 'TokenAdded');
    });

    it ('add supported fiats', async function() {
        await expect(Inventory.addFiats(['EUR'], [PriceFeed.target]))
            .to.emit(Inventory, 'FiatAdded');
    });
});

describe('getPrice()', async function()
{
    it ('BTC -> USD', async function() {
        const price = await Inventory.getPrice('WBTC', 'USD');
        expect(price).to.eq(61196749685);
    });
    it ('WETH -> USD', async function() {
        const price = await Inventory.getPrice('WETH', 'USD');
        expect(price).to.eq(3474809672);
    });
    it ('USDT -> USD', async function() {
        const price = await Inventory.getPrice('USDT', 'USD');
        expect(price).to.eq(1000000);
    });

    it ('BTC -> EUR', async function() {
        const price = await Inventory.getPrice('WBTC', 'EUR');
        expect(price).to.eq(57232002698);
    });
    it ('WETH -> EUR', async function() {
        const price = await Inventory.getPrice('WETH', 'EUR');
        expect(price).to.eq(3249687565);
    });
    it ('USDT -> USD', async function() {
        const price = await Inventory.getPrice('USDT', 'EUR');
        expect(price).to.eq(935213);
    });

    it ('USDT -> WETH', async function() {
        return expect(Inventory.getPrice('USDT', 'WETH')).to.be.reverted;
    });
});

describe('convert()', () => {
    it ('USD -> WBTC', async function() {
        const amount = await Inventory.convert(1234_567890, 'USD', 'WBTC', 10100);
        expect(amount).to.eq(1997400);
    });
    it ('USD -> WETH', async function() {
        const amount = await Inventory.convert(1234_567890, 'USD', 'WETH', 9900);
        expect(amount).to.eq(358879590665325144n);
    });
    it ('EUR -> WBTC', async function() {
        const amount = await Inventory.convert(1234_567890, 'EUR', 'WBTC', 10000);
        expect(amount).to.eq(2157128);
    });
    it ('EUR -> USDT', async function() {
        const amount = await Inventory.convert(1234_567890, 'EUR', 'USDT', 10000);
        expect(amount).to.eq(1320_092738);
    });
    it ('USD -> USDT', async function() {
        const amount = await Inventory.convert(1234_567890, 'USD', 'USDT', 10000);
        expect(amount).to.eq(1234567890);
    });
});
