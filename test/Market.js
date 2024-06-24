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
        priceFeeds = {}, repToken, inventory, market,
        deployer, seller, buyer, mediator,
        offers = [], deal;

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
        await MockBTC.transfer(seller.address, 10n * 10n**8n); // seller has 10 coins to sell
        await MockETH.transfer(seller.address, 2n * 10n**18n);
        await MockUSDT.transfer(buyer.address, 1000n * 10n**6n); // buyer has 1000 USDT
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

        describe('Inventory', function() {
            it('is NOT upgradable', async function () {
                const inventory = await ethers.getContractFactory("Inventory");
                return expect(upgrades.validateImplementation(inventory)).to.throw;
            });

            it('is deployed', async function() {
                inventory = await ethers.deployContract('Inventory', [MockUniswap.target]);
                return expect(inventory.target).to.be.properAddress;
            });

            it ('add supported tokens', async function() {
                const tokens = [MockBTC.target, MockETH.target, MockUSDT.target, MockDummy.target];
                await expect(inventory.addTokens(tokens)).to.emit(inventory, 'TokenAdded');
            });

            it ('remove token', async function() {
                const kill = await MockDummy.symbol();
                await expect(inventory.removeTokens([kill])).to.emit(inventory, 'TokenRemoved');
            });

            it ('add supported fiats', async function() {
                await expect(inventory.addFiats(
                    Object.keys(priceFeeds),
                    Object.values(priceFeeds).map(f => f.target)
                )).to.emit(inventory, 'FiatAdded');
            });

            it ('remove fiat', async function() {
                await expect(inventory.removeFiats(['XXX'])).to.emit(inventory, 'FiatRemoved');
            });
        });

        describe('Market', function() {
            it ('is upgradable', async function() {
                const MarketFactory = await ethers.getContractFactory("Market");
                return expect(upgrades.validateImplementation(MarketFactory)).to.eventually.be.undefined; // no error
            });

            it ('is deployed', async function() {
                market = await ethers.deployContract('Market');
                await market.initialize(repToken.target, inventory.target).then(tx => tx.wait());
                return expect(market.target).to.be.properAddress;
            });

            it('is owned by deployer', async function() {
                return expect(market.owner()).to.eventually.eq(deployer.address);
            });

            it ('set mediator address', async function() {
                await expect(await market.setMediator(mediator.address)).to.not.throw;
                await expect(await market.mediator()).to.eq(mediator.address);
            });

            it('set market address in rep token', async function() {
                await repToken.grantRole(MARKET_ROLE, market.target).then(tx => tx.wait());
                await expect(repToken.hasRole(MARKET_ROLE, market.target)).to.eventually.true;
            });

            // this is an expensive, but required one-time operation. Mediators must know the methods to solve disputes.
            it('add payment methods', async function() {
                const methods = [
                    {name: 'Zelle', group: 3, country: 188},
                    {name: 'SEPA',  group: 3, country: 1},
                    {name: 'Monero', group: 1, country: 0},
                    {name: 'Cash To ATM',  group: 2, country: 0},
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
            tokens = await inventory.tokens();
            expect(tokens).to.have.length(3);
            expect(tokens[0][1]).to.eq('WBTC');
            expect(tokens[1][1]).to.eq('WETH');
            expect(tokens[2][1]).to.eq('USDT');
        });

        it ('get fiats', async function() {
            fiats = await inventory.fiats();
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
            await expect(inventory.getPrice(await MockETH.symbol(), "USD")).to.eventually.eq(34748096); // 3474.8096 USDT per ETH
            await expect(inventory.getPrice(await MockETH.symbol(), "EUR")).to.eventually.eq(32496874);
            await expect(inventory.getPrice(await MockUSDT.symbol(), "USD")).to.eventually.eq(10000);
            await expect(inventory.getPrice(await MockUSDT.symbol(), "EUR")).to.eventually.eq(9352);
        });
    });

    describe('Users post offers', function()
    {
        it ('seller provides allowance', async function() {
            await MockBTC.connect(seller).approve(market.target, ethers.MaxUint256);
            await MockETH.connect(seller).approve(market.target, ethers.MaxUint256);
        });

        [
            [true, 'WBTC', 'USD', 'Zelle', 10250, 1000, 5000, 60, ''],
            [true, 'WBTC', 'USD', 'Zelle', 10400, 100,  1000, 60, ''],
            [true, 'WETH', 'EUR', 'SEPA',  10250, 1000, 5000, 60, ''],
            [true, 'USDT', 'USD', 'Zelle', 10250, 1000, 5000, 60, 'arbitrary terms'],
            [false, 'WBTC', 'USD', 'Zelle', 9800, 1000, 5000, 60, ''],
            [false, 'WBTC', 'USD', 'Zelle', 9650, 100,  1000, 60, ''],
            [false, 'WETH', 'EUR', 'SEPA',  9750, 1000, 5000, 60, ''],
            [false, 'USDT', 'USD', 'Zelle', 9950, 1000, 5000, 60, ''],
        ].forEach((params, i) => {
            const title = `#${i+1} ${params[0] ? 'Sell' : 'Buy'} ${params[1]} for ${params[2]}`;
            it(title, async function() {
                const provider = params[0] ? seller : buyer;
                market = market.connect(provider);
                const response = market.offerCreate(params).then((tx) => tx.wait()).then(receipt => {
                    const OfferCreated = market.interface.parseLog(receipt.logs[0]);
                    offers.push(OfferCreated.args[3]);
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
                offers[2][0],
                123450,
                'IBAN:DE89370400440532013000',
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[10]);
                deal = DealCreated.args[2];
                return receipt;
            });
            await expect(response)
                .to.emit(market, 'DealCreated')
                .withArgs(offers[2][0], mediator.address, anyValue);
            deal = await ethers.getContractAt('Deal', deal);
        });

        it ('has correct values', async function() {
            await expect(deal.tokenAmount()).to.eventually.eq(37053658); // 8 decimals
        });

        it ('accepted by mediator', async function() {
            deal = await deal.connect(mediator);
            await expect(deal.accept()).to.not.emit(deal, 'DealState');
        });

        it ('accepted by owner', async function() {
            deal = await deal.connect(seller);
            await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
        });

        it ('tokens are deposited', async function() {
            await expect(MockETH.balanceOf(deal.target)).to.eventually.eq(37053658n * 10n**10n); // ETH precision - 8
        })
    });

    describe('Buyer marks paid', function() {
        it('event emitted', async function() {
            deal = await deal.connect(buyer);
            const response = deal.paid(deal).then((tx) => tx.wait());
            await expect(response).to.emit(deal, 'DealState');
        });
    });

    describe('Seller releases tokens', function() {
        it('event emitted', async function() {
            deal = await deal.connect(seller);
            const response = deal.release(deal).then((tx) => tx.wait());
            await expect(response).to
                .emit(deal, 'DealState')
                .emit(MockETH, 'Transfer')
                .emit(MockETH, 'Transfer');
        });
        it('buyer receives tokens', async function() {
            await expect(MockETH.balanceOf(buyer.address)).to.eventually.eq(366831220000000000n);
        });
        it('mediator receives fees', async function() {
            await expect(MockETH.balanceOf(mediator.address)).to.eventually.eq(3705360000000000n);
        });
    });

    describe('Buyer cancels deal', function() {
        it ('open another deal', async function() {
            market = await market.connect(buyer);
            const response = market.createDeal(
                offers[2][0],
                123450,
                'IBAN:DE89370400440532013000',
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[10]);
                deal = DealCreated.args[2];
                return receipt;
            });
            await expect(response)
                .to.emit(market, 'DealCreated')
                .withArgs(offers[2][0], mediator.address, anyValue);
            deal = await ethers.getContractAt('Deal', deal);
        });
        it ('accepted by seller', async function() {
            deal = await deal.connect(seller);
            await expect(deal.accept()).to.emit(deal, 'DealState').emit(MockETH, 'Transfer');
        });
        it('seller cannot cancel', async function() {
            deal = await deal.connect(seller);
            const response = deal.cancel().then((tx) => tx.wait());
            await expect(response).to.reverted;
        });
        it('event emitted', async function() {
            deal = await deal.connect(buyer);
            const response = deal.cancel().then((tx) => tx.wait());
            await expect(response).to
                .emit(deal, 'DealState')
                .emit(MockETH, 'Transfer');
        });
        it ('seller gets refund', async function() {
            await expect(MockETH.balanceOf(deal.target)).to.eventually.eq(0);
            await expect(MockETH.balanceOf(seller.address)).to.eventually.eq(1629463420000000000n);
        });
    });

    describe('buyer disputes deal', function() {
        it ('open another deal', async function() {
            market = await market.connect(buyer);
            const response = market.createDeal(
                offers[2][0],
                123450,
                'IBAN:DE89370400440532013000',
            ).then((tx) => tx.wait()).then(receipt => {
                const DealCreated = market.interface.parseLog(receipt.logs[10]);
                deal = DealCreated.args[2];
                return receipt;
            });
            await expect(response)
                .to.emit(market, 'DealCreated')
                .withArgs(offers[2][0], mediator.address, anyValue);
            deal = await ethers.getContractAt('Deal', deal);
        });
        it ('deal state changed', async function() {
            deal = await deal.connect(buyer);
            await expect(deal.dispute(deal)).to.emit(deal, 'DealState');
        });
    });

    describe('Messaging', function() {
        it('seller sends message', async function() {
            deal = await deal.connect(seller);
            await expect(deal.message('Hello buyer!')).to.emit(deal, 'Message');
        });
        it('buyer sends message', async function() {
            deal = await deal.connect(buyer);
            await expect(deal.message('Hello seller!')).to.emit(deal, 'Message');
        });
    });
});
