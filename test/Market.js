const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

function address(number) {
    let hexString = number.toString(16);

    while (hexString.length < 40) {
        hexString = '0' + hexString;
    }
    return '0x' + hexString;
}

describe("Market", function()
{
    let MockBTC, priceOracle, market,
        deployer, seller, buyer, mediator,
        offerId, dealId;

    async function deployBtc() {
        const BTC = await ethers.getContractFactory("MockWBTC");
        return await BTC.deploy();
    }

    async function deployPriceOracle() {
        const priceOracleFactory = await ethers.getContractFactory("MockPriceOracle");
        return await priceOracleFactory.deploy();
    }

    async function deployMarket(MockBTC) {
        const MarketFactory = await ethers.getContractFactory("Market");
        return await upgrades.deployProxy(MarketFactory, [
            ['USDT', 'WETH', 'WBTC'],
            ['0xdAC17F958D2ee523a2206206994597C13D831ec7',
            '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD',
            MockBTC.target],
            ['USD']
        ]);
    }

    before(async function() {
        [deployer, seller, buyer, mediator] = await ethers.getSigners();
        MockBTC = await deployBtc();
        priceOracle = await deployPriceOracle();
        market = await deployMarket(MockBTC);
    });

    describe('Deploy', function() {
        it('is ownable', async function() {
            expect(market.owner()).to.eventually.eq(deployer.address);
        });

        it("is upgradable", async function() {
            const MarketFactory = await ethers.getContractFactory("Market");
            const newMarket = await upgrades.upgradeProxy(await market.getAddress(), MarketFactory);
            expect(newMarket.owner()).to.eventually.eq(deployer.address);
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
    });

    describe('Create offer', function() {
        let params = {
            isSell: true,
            crypto: WETH,
            fiat: address(840), // USD
            price: 100,
            min: 1000,
            max: 5000,
            method: 2,
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        it('event emitted', async function() {
            const response = await market.offerCreate(params).then((tx) => tx.wait());
            await expect(response)
                .to.emit(market, 'OfferCreated')
                // bugged plugin changes WETH address case
                .withArgs(true, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', address(840), 0, anyValue);
        });

        it('invalid fiat currency', async function() {
            let invalidParams = {...params, fiat: address(0)};
            await expect(market.offerCreate(invalidParams)).to.be.reverted;
        });

        it('invalid price', async function() {
            let invalidParams = {...params, price: 0};
            await expect(market.offerCreate(invalidParams)).to.be.reverted;
        });

        it ('invalid min', async function() {
            let invalidParams = {...params, min: 0};
            await expect(market.offerCreate(invalidParams)).to.be.reverted;
        });

        it('invalid max', async function() {
            let invalidParams = {...params, max: 0};
            await expect(market.offerCreate(invalidParams)).to.be.reverted;
        });

        it('invalid delivery method', async function() {
            let invalidParams = {...params, method: 1000};
            await expect(market.offerCreate(invalidParams)).to.be.reverted;
        });
    });

    describe('Create deal', function() {
        it('valid data', async function() {
            await expect(market.createDeal(
                0,
                1**18,
                3500 * 10**6,
                mediator.getAddress()
            )).to.emit(market, 'DealCreated');
        });

        it ('accepted by mediator', async function() {
            market = await market.connect(mediator);
            await expect(market.acceptDeal(0)).to.not.emit(market, 'DealState');
        });

        it ('accepted by owner', async function() {
            market = await market.connect(deployer);
            await expect(market.acceptDeal(0)).to.emit(market, 'DealState');
        });
    });
});
