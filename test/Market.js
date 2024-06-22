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

/**
 * Top-level suite name is required for IDE mocha test runner.
 */
describe("Market", function()
{
    let MockBTC, priceOracle, repToken, market,
        seller, buyer, mediator,
        offer, deal;

    async function deployPriceOracle() {
        const priceOracleFactory = await ethers.getContractFactory("MockPriceOracle");
        priceOracle = await priceOracleFactory.deploy();
        await priceOracle.waitForDeployment();
        return priceOracle;
    }

    async function deployMarket() {
        const MarketFactory = await ethers.getContractFactory("Market");
        market = await upgrades.deployProxy(MarketFactory, [
            repToken.target,
            ['USDT', 'WETH', 'WBTC'],
            ['0xdAC17F958D2ee523a2206206994597C13D831ec7',
            '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
            MockBTC.target],
            ['USD']
        ]);
        await market.waitForDeployment();
        return market;
    }

    /**
     * Only mocks here. Actual deployment is explained in the first test.
     */
    before(async function() {
        [seller, buyer, mediator] = await ethers.getSigners();
        MockBTC = await deployMockERC20('WBTC', 8);
        priceOracle = await deployPriceOracle();
        repToken = await deployRepToken();
        market = await deployMarket();
    });

    describe('Deploy', function() {
        it('is ownable', async function() {
            expect(market.owner()).to.eventually.eq(seller.address);
        });

        it("is upgradable", async function() {
            const MarketFactory = await ethers.getContractFactory("Market");
            const newMarket = await upgrades.upgradeProxy(await market.getAddress(), MarketFactory);
            expect(newMarket.owner()).to.eventually.eq(seller.address);
        });

        it('Add delivery method', async function() {
            const methods = [
                {name: 'Zelle', group: 3, country: 188},
                {name: 'SEPA',  group: 3, country: 1},
                {name: 'Monero', group: 1, country: 0},
                {name: 'Cash To ATM',  group: 2, country: 0},
            ];
            for (const method of methods) {
                let receipt = await market.methodAdd(method.name, method.group, method.country).then((tx) => tx.wait());
                await expect(receipt).to.emit(market, 'MethodAdded');
                var methodId = receipt.logs[0].topics[1];
            }

            const receipt = await market.methodRemove(methodId).then((tx) => tx.wait());
            await expect(receipt).to.emit(market, 'MethodRemoved');
        });

        it('grant market role to REP', async function() {
            await repToken.grantRole(ethers.id('MARKET_ROLE'), market.target);
            await expect(repToken.hasRole(ethers.id('MARKET_ROLE'), market.target)).to.eventually.true;
        });
    });

    describe('Seller posts an offer', function() {
        function params(options = {}) {
            return {
                isSell: true,
                crypto: MockBTC.target,
                fiat: address(840), // USD
                price: 100,
                min: 1000,
                max: 5000,
                method: 2,
                paymentTimeLimit: 60,
                terms: 'No KYC',
                ...options
            };
        }

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

            it('invalid delivery method', async function() {
                await expect(market.offerCreate(params({method: 1000})))
                    .to.be.reverted;
            });
        });

        it('provides allowance', async function() {
            market = await market.connect(seller);
            const receipt = MockBTC.approve(market.target, ethers.MaxUint256).then((tx) => tx.wait());
            await expect(receipt).to.emit(MockBTC, 'Approval');
            await expect(MockBTC.allowance(seller.address, market.target)).to.eventually.eq(ethers.MaxUint256);
        });

        it('event emitted', async function() {
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
