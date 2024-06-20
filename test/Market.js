const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

describe("Market", function()
{
    let uniswapOracle, market, owner, seller, buyer, mediator;

    async function deployUniswapOracle() {
        const UNISWAP_FACTORY = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c'; // sepolia
        const uniswapOracleFactory = await ethers.getContractFactory("UniswapOracle");
        uniswapOracle = await uniswapOracleFactory.deploy(UNISWAP_FACTORY);
        await uniswapOracle.waitForDeployment();
    }

    async function deploy() {
        const [owner, seller, buyer, mediator] = await ethers.getSigners();
        const MarketFactory = await ethers.getContractFactory("Market");
        const market = await upgrades.deployProxy(MarketFactory, [
            owner.address,
            uniswapOracle.target,
            ['USDT', 'HZ', 'WETH'],
            ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xCBCdF9626bC03E24f779434178A73a0B4bad62eD'],
            ['USD']
        ]);
        await market.waitForDeployment();
        return { market, owner, seller, buyer, mediator };
    }

    before(async function() {
        await deployUniswapOracle();
        const result = await deploy();
        market = result.market;
        owner = result.owner;
        seller = result.seller;
        buyer = result.buyer;
        mediator = result.mediator;
    });

    describe('Deploy', function() {
        it('is ownable', async function() {
            expect(market.owner()).to.eventually.eq(owner.address);
        });

        it("is upgradable", async function() {
            const MarketFactory = await ethers.getContractFactory("Market");
            const newMarket = await upgrades.upgradeProxy(await market.getAddress(), MarketFactory);
            expect(newMarket.owner()).to.eventually.eq(owner.address);
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
            fiat: 43, // EUR
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
                .withArgs(true, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 43, 0, anyValue);
        });

        it('invalid fiat currency', async function() {
            let invalidParams = {...params, fiat: 254};
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

    describe('Prices', function() {
        it('ETH / USDT', async function() {
            const price = await market.getPrice('WETH', 'USD');
            expect(price).to.be.gt(0);
        });

        /*it('get price for unknown token', async function() {
            await expect(market.price('0x'), 43).to.be.reverted;
        });*/
    });
});
