const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {deployMockERC20} = require("./mocks");

function address(number) {
    let hexString = number.toString(16);

    while (hexString.length < 40) {
        hexString = '0' + hexString;
    }
    return '0x' + hexString;
}

const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const MARKET_ROLE = ethers.id('MARKET_ROLE');

/**
 * Top-level suite name is required for IDE mocha test runner.
 */
describe("Market", function()
{
    const fiats = ['THB', 'EUR', 'XXX'];
    let MockUniswap, MockBTC, MockETH, MockUSDT, MockDummy,
        priceFeeds = {}, repToken, market,
        deployer, seller, buyer, mediator,
        offer, deal;

    /**
     * Only mocks here. Actual deployment is explained in the first test.
     */
    before(async function() {
        [deployer, seller, buyer, mediator] = await ethers.getSigners();
        MockUniswap = await ethers.deployContract('MockUniswapV3Factory');
        MockBTC = await deployMockERC20('WBTC', 8);
        MockETH =  await deployMockERC20('WETH', 18);
        MockUSDT = await deployMockERC20('USDT', 6);
        MockDummy = await deployMockERC20('Dummy', 18);
        MockBTC.transfer(seller.address, 10 * 10**8); // seller has 10 coins to sell
        MockETH.transfer(seller.address, 2 * 10**18);
        MockUSDT.transfer(buyer.address, 1000 * 10**6); // buyer has 1000 USDT
    });

    /**
     * In tests all contracts are deployed directly without proxy to ease debugging, speedup runs and keep stacktraces clean.
     * Deployment scripts MUST deploy proxies.
     */
    describe('Deployment Sequence', function()
    {
        describe('price feeds not in chainlink', function()
        {
            it ('is NOT upgradable', async function() {
                const factory = await ethers.getContractFactory("PriceFeed");
                return expect(upgrades.validateImplementation(factory)).to.throw;
            });

            fiats.forEach((fiat, i) => {
                it (`${fiat} is deployed`, async function() {
                    const feed = await ethers.deployContract('PriceFeed', [fiat]);
                    priceFeeds[fiat] = feed;
                    return expect(feed.target).to.be.properAddress;
                });
            })

            it ('keep the feeds updated', async function() {
                await priceFeeds['EUR'].set(106927500);
                const data = await priceFeeds['EUR'].latestRoundData();
                expect(data[1]).to.eq(106927500);
            });
        });

        describe('Reputation token', function(){
            it ('is upgradable', async function() {
                const factory = await ethers.getContractFactory("RepToken");
                return expect(upgrades.validateImplementation(factory)).to.eventually.be.undefined; // no error
            });

            it('is deployed', async function() {
                repToken = await ethers.deployContract('RepToken');
                await expect(repToken.initialize().then(tx => tx.wait())).to
                    .emit(repToken, 'RoleGranted')
                    .withArgs(DEFAULT_ADMIN_ROLE, deployer.address, deployer.address);
                return expect(repToken.target).to.be.properAddress;
            });

            it ('deployer is default admin', async function() {
                return expect(repToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.eventually.true;
            });
        });

        describe('Market', function() {
            it ('is upgradable', async function() {
                const MarketFactory = await ethers.getContractFactory("Market");
                return expect(upgrades.validateImplementation(MarketFactory)).to.eventually.be.undefined; // no error
            });

            it ('is deployed', async function() {
                market = await ethers.deployContract('Market');
                await market.initialize(repToken.target, MockUniswap.target).then(tx => tx.wait());
                return expect(market.target).to.be.properAddress;
            });

            it('is owned by deployer', async function() {
                return expect(market.owner()).to.eventually.eq(deployer.address);
            });

            it('set market address in rep token', async function() {
                await repToken.grantRole(MARKET_ROLE, market.target).then(tx => tx.wait());
                await expect(repToken.hasRole(MARKET_ROLE, market.target)).to.eventually.true;
            });

            it ('add supported tokens', async function() {
                const tokens = [MockBTC.target, MockETH.target, MockUSDT.target, MockDummy.target];
                await expect(market.addTokens(tokens)).to.emit(market, 'TokenAdded');
            });

            it ('remove token', async function() {
                const kill = ethers.encodeBytes32String(await MockDummy.symbol());
                await expect(market.removeTokens([kill])).to.emit(market, 'TokenRemoved');
            });

            it ('add supported fiats', async function() {
                await expect(market.addFiats(
                    Object.keys(priceFeeds).map(ethers.encodeBytes32String),
                    Object.values(priceFeeds).map(f => f.target)
                )).to.emit(market, 'FiatAdded');
            });

            it ('remove fiat', async function() {
                const kill = ethers.encodeBytes32String('XXX');
                await expect(market.removeFiats([kill])).to.emit(market, 'FiatRemoved');
            });

            // this is an expensive, but required one-time operation. Mediators must know the methods to solve disputes.
            it('add payment methods', async function() {
                const methods = [
                    {name: ethers.encodeBytes32String('Zelle'), group: 3, country: 188},
                    {name: ethers.encodeBytes32String('SEPA'),  group: 3, country: 1},
                    {name: ethers.encodeBytes32String('Monero'), group: 1, country: 0},
                    {name: ethers.encodeBytes32String('Cash To ATM'),  group: 2, country: 0},
                ];
                await expect(market.addMethods(methods)).to.emit(market, 'MethodAdded');

                //const receipt = await market.methodRemove(methodId).then((tx) => tx.wait());
                //await expect(receipt).to.emit(market, 'MethodRemoved');
            });
        });
    });

    /**
     * How to get data for React client.
     */
    describe('Browser builds UI', function ()
    {
        let tokens, fiats, methods = [];

        it ('get tokens', async function() {
            tokens = await market.tokens();
            expect(tokens).to.have.length(3);
            expect(tokens[0][1]).to.eq('WBTC');
            expect(tokens[1][1]).to.eq('WETH');
            expect(tokens[2][1]).to.eq('USDT');
        });

        it ('get fiats', async function() {
            fiats = await market.fiats();
            fiats = fiats.map(ethers.decodeBytes32String);
            expect(fiats).to.have.length(2);
            expect(fiats[0]).to.eq('THB');
            expect(fiats[1]).to.eq('EUR');
        });

        it ('get methods', async function() {
            methods = await market.methods();
            methods = methods.map(ethers.decodeBytes32String);
            await expect(methods).to.have.length(4);
            await expect(methods[0]).to.eq('Zelle');
            await expect(methods[1]).to.eq('SEPA');
        });

        it ('get prices', async function() {
            await expect(market.getPrice(await MockETH.symbol(), "USD")).to.eventually.eq(34748096); // 3474.8096 USDT per ETH
            await expect(market.getPrice(await MockETH.symbol(), "EUR")).to.eventually.eq(32496874);
            await expect(market.getPrice(await MockUSDT.symbol(), "USD")).to.eventually.eq(10000);
            await expect(market.getPrice(await MockUSDT.symbol(), "EUR")).to.eventually.eq(9352);
        });
    });

    describe('Users post offers', function()
    {
        const offerParams = [
            [true, 'WBTC', 'USD', 'Zelle', 10250, 1000, 5000, 60, ''],
            [true, 'WBTC', 'USD', 'Zelle', 10400, 100,  1000, 60, ''],
            [true, 'WETH', 'EUR', 'SEPA',  10250, 1000, 5000, 60, ''],
            [true, 'USDT', 'USD', 'Zelle', 10250, 1000, 5000, 60, 'arbitrary terms'],
            [false, 'WBTC', 'USD', 'Zelle', 9800, 1000, 5000, 60, ''],
            [false, 'WBTC', 'USD', 'Zelle', 9650, 100,  1000, 60, ''],
            [false, 'WETH', 'EUR', 'SEPA',  9750, 1000, 5000, 60, ''],
            [false, 'USDT', 'USD', 'Zelle', 9950, 1000, 5000, 60, ''],
        ];

        offerParams.forEach((params, i) => {
            const title = `#${i+1} ${params[0] ? 'Sell' : 'Buy'} ${params[1]} for ${params[2]}`;
            it(title, async function() {
                const provider = params[0] ? seller : buyer;
                market = market.connect(provider);
                const response = market.offerCreate(params).then((tx) => tx.wait()).then(receipt => {
                    const OfferCreated = market.interface.parseLog(receipt.logs[0]);
                    offer = OfferCreated.args[3];
                    return receipt;
                });
                await expect(response)
                    .to.emit(market, 'OfferCreated')
                    .withArgs(provider.address, anyValue, anyValue, anyValue);
            });
        });

        describe('invalid input', async function() {
            function params(replace = {}) {
                return {
                    isSell: true,
                    token: "WBTC",
                    fiat:  "EUR",
                    rate: 10250, // 1.025 * market price
                    min: 1000,
                    max: 5000,
                    method: 'Zelle',
                    paymentTimeLimit: 60,
                    terms: 'No KYC',
                    ...replace
                };
            }
            it('invalid fiat currency', async function() {
                await expect(market.offerCreate(params({fiat: 'USDT'}))).to.be.reverted;
                await expect(market.offerCreate(params({fiat: 'XXX'}))).to.be.reverted;
            });

            it('invalid rate', async function() {
                await expect(market.offerCreate(params({rate: 0}))).to.be.reverted;
            });

            it ('invalid min', async function() {
                await expect(market.offerCreate(params({min: 0}))).to.be.reverted;
            });

            it('invalid max', async function() {
                await expect(market.offerCreate(params({max: 0}))).to.be.reverted;
            });

            it('invalid method', async function() {
                await expect(market.offerCreate(params({method: 'Hugs and kisses'}))).to.be.reverted;
            });
        });
    });

    describe('Browser fetches offers', function() {
        it('get SELL WBTC for USD with Zelle', async function() {
            const offers = await market.getOffers(true, 'WBTC', 'USD', 'Zelle');
            expect(offers).to.have.length(2);
        });

        it('get BUY WETH for EUR with any method', async function() {
            const offers = await market.getOffers(true, 'WETH', 'EUR', '');
            expect(offers).to.have.length(1);
        });
    });

    describe('Buyer opens deal', function() {
        it('event emitted', async function() {
            market = await market.connect(buyer);
            const response = market.createDeal(
                offer[0],
                1**8,
                3500 * 10**6,
                mediator.getAddress()
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[0]);
                deal = DealCreated.args[2];
                return receipt;
            });
            await expect(response)
                .to.emit(market, 'DealCreated')
                .withArgs(offer[0], mediator.address, anyValue);
        });

        it ('accepted by mediator', async function() {
            market = await market.connect(mediator);
            await expect(market.acceptDeal(deal[0])).to.not.emit(market, 'DealState');
        });

        it ('accepted by owner', async function() {
            market = await market.connect(seller);
            await expect(market.acceptDeal(deal[0])).to.emit(market, 'DealState');
        });
    });

    describe('Buyer marks paid', function() {
        it('event emitted', async function() {
            market = await market.connect(buyer);
            const response = market.paidDeal(deal[0]).then((tx) => tx.wait());
            await expect(response).to.emit(market, 'DealState');
        });
    });

    describe('Seller releases tokens', function() {
        it('event emitted', async function() {
            market = await market.connect(seller);
            const response = market.completeDeal(deal[0]).then((tx) => tx.wait());
            await expect(response).to.emit(market, 'DealState');
        });
        it('buyer receives tokens', async function() {
            await expect(MockBTC.balanceOf(buyer.address)).to.eventually.eq(deal[8]);
        });
    });

    describe('Buyer cancels deal', function() {
        it ('open another deal', async function() {
            market = await market.connect(buyer);
            await market.createDeal(
                offer[0],
                1**18,
                3500 * 10**6,
                mediator.getAddress()
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[0]);
                deal = DealCreated.args[2];
                return receipt;
            });
        });
        it('seller cannot cancel', async function() {
            market = await market.connect(seller);
            const response = market.cancelDeal(deal[0]).then((tx) => tx.wait());
            await expect(response).to.reverted;
        });
        it('event emitted', async function() {
            market = await market.connect(buyer);
            const response = market.cancelDeal(deal[0]).then((tx) => tx.wait());
            await expect(response).to.emit(market, 'DealState');
        });
    });

    describe('buyer disputes deal', function() {
        it ('event emitted', async function() {
            market = await market.connect(buyer);
            await market.createDeal(
                offer[0],
                1**18,
                3500 * 10**6,
                mediator.getAddress()
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[0]);
                deal = DealCreated.args[2];
            });
            await market.paidDeal(deal[0]).then((tx) => tx.wait());
            await expect(market.disputeDeal(deal[0])).to.emit(market, 'DealState');
        });
    });

    describe('Messaging', function() {
        it('seller sends message', async function() {
            market = await market.connect(seller);
            await expect(market.message(deal[0], 'Hello buyer!')).to.emit(market, 'Message');
        });
        it('buyer sends message', async function() {
            market = await market.connect(buyer);
            await expect(market.message(deal[0], 'Hello seller!')).to.emit(market, 'Message');
        });
    });
});
