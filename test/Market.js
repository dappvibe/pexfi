const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {deployRepToken} = require("./RepToken");
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
    let MockBTC, MockUniswap, priceOracle, repToken, market,
        deployer, seller, buyer, mediator,
        offer, deal;

    /**
     * Only mocks here. Actual deployment is explained in the first test.
     */
    before(async function() {
        [deployer, seller, buyer, mediator] = await ethers.getSigners();
        MockUniswap = await ethers.deployContract('MockUniswapV3Factory');
        MockBTC = await deployMockERC20('WBTC', 8);
        await MockBTC.transfer(seller.address, 10 * 10**8); // seller has 10 coins to sell
    });

    /**
     * In tests all contracts are deployed directly without proxy to ease debugging, speedup runs and keep stacktraces clean.
     * Deployment scripts MUST deploy proxies.
     */
    describe('Deployment Sequence', function()
    {
        describe('1. Reputation token', function(){
            it ('is upgradable', async function() {
                const factory = await ethers.getContractFactory("RepToken");
                return expect(upgrades.validateImplementation(factory)).to.eventually.be.undefined; // no error
            });

            it('is deployed', async function() {
                repToken = await ethers.deployContract('RepToken');
                await expect(repToken.initialize()).to
                    .emit(repToken, 'RoleGranted')
                    .withArgs(DEFAULT_ADMIN_ROLE, deployer.address, deployer.address);
                return expect(repToken.target).to.be.properAddress;
            });

            it ('deployer is default admin', async function() {
                return expect(repToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.eventually.true;
            });
        });

        describe('2. Market', function() {
            it ('is upgradable', async function() {
                const MarketFactory = await ethers.getContractFactory("Market");
                return expect(upgrades.validateImplementation(MarketFactory)).to.eventually.be.undefined; // no error
            });

            it ('is deployed', async function() {
                market = await ethers.deployContract('Market');
                await market.initialize(
                    repToken.target,
                    [
                        {target: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether', symbol: 'USDT', decimals: 6},
                        {target: '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18},
                        {target: MockBTC.target, name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8}
                    ],
                    [ethers.encodeBytes32String('USD')]
                );
                return expect(market.target).to.be.properAddress;
            });

            it('is owned by deployer', async function() {
                return expect(market.owner()).to.eventually.eq(deployer.address);
            });

            it('set market address in rep token', async function() {
                await repToken.grantRole(MARKET_ROLE, market.target);
                await expect(repToken.hasRole(MARKET_ROLE, market.target)).to.eventually.true;
            });

            // this is an expensive, but required one-time operation. Mediators must know the methods to solve disputes.
            it('add payment methods', async function() {
                const methods = [
                    {name: ethers.encodeBytes32String('Zelle'), group: 3, country: 188},
                    {name: ethers.encodeBytes32String('SEPA (EU) Instant'),  group: 3, country: 1},
                    {name: ethers.encodeBytes32String('Monero'), group: 1, country: 0},
                    {name: ethers.encodeBytes32String('Cash To ATM'),  group: 2, country: 0},
                ];
                await expect(market.addMethods(methods)).to.emit(market, 'MethodAdded');

                //const receipt = await market.methodRemove(methodId).then((tx) => tx.wait());
                //await expect(receipt).to.emit(market, 'MethodRemoved');
            });
        });

        describe('3. Price Oracle', function() {
            it ('is NOT upgradable', async function() {
                const factory = await ethers.getContractFactory("PriceOracle");
                return expect(upgrades.validateImplementation(factory)).to.throw;
            });

            it ('is deployed', async function() {
                priceOracle = await ethers.deployContract('PriceOracle', [
                    MockUniswap.target,
                    [], []
                ]);
                return (expect(priceOracle.target)).to.be.properAddress;
            });
        });
    });

    describe('Offer to sell', function()
    {
        describe('1. Seller post an offer', function()
        {
            function params(replace = {}) {
                return {
                    isSell: true,
                    crypto: MockBTC.target,
                    fiat: address(840), // USD
                    price: 100,
                    min: 1000,
                    max: 5000,
                    method: ethers.encodeBytes32String('Zelle'),
                    country: 0, // global
                    paymentTimeLimit: 60,
                    terms: 'No KYC',
                    ...replace
                };
            }

            it ('browser gets available methods', async function() {
                const methods = await market.methods();
                expect(methods).to.have.length(4);
                expect(ethers.decodeBytes32String(methods[0])).to.eq('Zelle');
                expect(ethers.decodeBytes32String(methods[1])).to.eq('SEPA (EU) Instant');
                expect(ethers.decodeBytes32String(methods[2])).to.eq('Monero');
                expect(ethers.decodeBytes32String(methods[3])).to.eq('Cash To ATM');
            });

            it ('browser gets available currencies', async function() {
                const currencies = await market.currencies();
                expect(currencies).to.have.length(3);
                expect(currencies[0]).to.eq('USDT');
                expect(currencies[1]).to.eq('WETH');
                expect(currencies[2]).to.eq('WBTC');
            });

            describe('with invalid input', async function() {
                it('invalid fiat currency', async function() {
                    await expect(market.offerCreate(params({fiat: address(0)})))
                        .to.be.reverted;
                });

                it('invalid price', async function() {
                    await expect(market.offerCreate(params({price: 0})))
                        .to.be.reverted;
                });

                it ('invalid min', async function() {
                    await expect(market.offerCreate(params({min: 0})))
                        .to.be.reverted;
                });

                it('invalid max', async function() {
                    await expect(market.offerCreate(params({max: 0})))
                        .to.be.reverted;
                });

                it('invalid method', async function() {
                    await expect(market.offerCreate(params({method: ethers.encodeBytes32String('Hugs and kisses')})))
                        .to.be.reverted;
                });
            });

            /*        it('should provide allowance first', async function() {
                        market = await market.connect(seller);
                        // FIXME because max in offer is in USD, market must know current price to move the tokens
                        await expect(MockBTC.approve(market.target, 0.5 ** 10*8)).to.emit(MockBTC, 'Approval');
                        await expect(MockBTC.allowance(seller.address, market.target)).to.eventually.eq(0.5 * 10**8);
                    });*/

            it('OfferCreated emitted', async function() {
                market = market.connect(seller);
                const response = market.offerCreate(params()).then((tx) => tx.wait()).then(receipt => {
                    const OfferCreated = market.interface.parseLog(receipt.logs[0]);
                    offer = OfferCreated.args[3];
                    return receipt;
                });
                await expect(response)
                    .to.emit(market, 'OfferCreated')
                    // bugged plugin changes WETH address case
                    .withArgs(seller.address, MockBTC.target, address(840), anyValue);
            });
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
