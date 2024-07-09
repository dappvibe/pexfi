const {ethers, upgrades, ignition} = require("hardhat");
const {expect} = require("chai");
const PriceFeedModule = require("../../ignition/modules/PriceFeed");
const MarketModule = require("../../ignition/modules/Market");

let Uniswap, Tokens = {},
    PriceFeeds = {}, RepToken, Market, DealFactory, OfferFactory,
    deployer, buyer, seller;

before(async function() {
    [deployer, buyer, seller] = await ethers.getSigners();
});

describe('Deployment', function()
{
    describe('Mocks', () => {
        it ('ERC20 Tokens', async function() {
            const tokens = [
                ['WBTC', 8], ['WETH', 18], ['USDT', 6]
            ];
            const factory = await ethers.getContractFactory("MockERC20");
            for (const token of tokens) {
                const t = Tokens[token[0]] = await factory.deploy(...token);
                // deployer has all the tokens minted, share some for the tests
                t.transfer(seller.address, 10000 * Math.pow(10, token[1]));
            }
        });

        it ('Uniswap Factory', async function() {
            Uniswap = await ethers.deployContract('MockUniswapV3Factory');
            // see uniswap contract for hardcoded return values
            Uniswap.setPool(Tokens['WBTC'], await ethers.deployContract('PoolBTC'));
            Uniswap.setPool(Tokens['WETH'], await ethers.deployContract('PoolETH'));
        });
    });

    describe ('Fiat oracles', function()
    {
        const fiats = {
            USD: 1_00000000, EUR: 1_06927500, THB: 36_43338519
        }
        for (let fiat in fiats) {
            it (`${fiat} is deployed`, async function() {
                const { PriceFeed } = await ignition.deploy(PriceFeedModule, {
                    parameters: { PriceFeed: {
                        currency: fiat
                    }}
                })
                PriceFeeds[fiat] = PriceFeed;
            });
            it (`set() ${fiat} rate`, async function() {
                await PriceFeeds[fiat].set(fiats[fiat]);
                const data = await PriceFeeds[fiat].latestRoundData();
                expect(data[1]).to.eq(fiats[fiat]);
            });
        }
    });

    describe('Market', function()
    {
        it ('Market (ignition bundle)', async function() {
            const { Market, OfferFactory, DealFactory, RepToken } = await ignition.deploy(MarketModule, {
                parameters: { Market: {
                    uniswap: Uniswap.target,
                    addTokens_0: Object.values(Tokens).map(t => t.target),
                    addTokens_1: 500,
                    fiats: [
                        ['USD', PriceFeeds['USD'].target],
                        ['EUR', PriceFeeds['EUR'].target],
                        ['THB', PriceFeeds['THB'].target]
                    ],
                    methods: [
                        ['Zelle', 0],
                        ['SEPA', 0],
                    ]
                }}
            });
            expect(await Market.owner()).to.eq(deployer.address);
            expect(await Market.mediator()).to.eq(deployer.address);
            expect(await Market.offerFactory()).to.not.eq(ethers.ZeroAddress);
            expect(await Market.dealFactory()).to.not.eq(ethers.ZeroAddress);
            expect(await Market.repToken()).to.not.eq(ethers.ZeroAddress);

            expect(await OfferFactory.market()).to.eq(Market.target);
            expect(await DealFactory.market()).to.eq(Market.target);
            expect(await RepToken.hasRole(ethers.encodeBytes32String('MARKET_ROLE'), Market.target)).to.be.true;
        });
    });
});
