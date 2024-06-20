const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const WETH = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

describe("Market", function() {
    async function deploy() {
        const [owner, seller, buyer, mediator] = await ethers.getSigners();
        const MarketFactory = await ethers.getContractFactory("Market");
        const market = await upgrades.deployProxy(MarketFactory, [owner.address]);
        await market.waitForDeployment();
        return { market, owner, seller, buyer, mediator };
    }

    it("Deployment is upgradable", async function() {
        const { market, owner } = await loadFixture(deploy);
        expect(market.owner()).to.eventually.eq(owner.address);

        const MarketFactory = await ethers.getContractFactory("Market");
        const newMarket = await upgrades.upgradeProxy(await market.getAddress(), MarketFactory);
        expect(newMarket.owner()).to.eventually.eq(owner.address);
    });

    it('Add delivery method', async function() {
        const { market } = await loadFixture(deploy);
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

    it('Create offer', async function() {
        const { market } = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 43, // EUR
            price: 100,
            min: 1000,
            max: 5000,
            deliveryMethod: 'bank',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        const response = await market.offerCreate(params).then((tx) => tx.wait());
        await expect(response)
            .to.emit(market, 'OfferCreated')
            // bugged plugin changes WETH address case
            .withArgs(true, '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', 43, 0, anyValue);
    });

    it('Create offer with invalid fiat currency', async function() {
        const {market} = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 254,
            price: 100,
            min: 1000,
            max: 5000,
            deliveryMethod: 'bank',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        //await expect(market.offerCreate(params)).to.be.revertedWith('Invalid fiat currency');
        await expect(market.offerCreate(params)).to.be.reverted;
    });

    it('Create offer with invalid price', async function() {
        const {market} = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 43,
            price: 0,
            min: 1000,
            max: 5000,
            deliveryMethod: 'bank',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        await expect(market.offerCreate(params)).to.be.reverted;
    });

    it ('Create offer with invalid min', async function() {
        const {market} = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 43,
            price: 100,
            min: 0,
            max: 5000,
            deliveryMethod: 'bank',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        await expect(market.offerCreate(params)).to.be.reverted;
    });

    it('Create offer with invalid max', async function() {
        const {market} = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 43,
            price: 100,
            min: 1000,
            max: 0,
            deliveryMethod: 'bank',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        await expect(market.offerCreate(params)).to.be.reverted;
    });

    it('Create offer with invalid delivery method', async function() {
        const {market} = await loadFixture(deploy);
        const params = {
            isSell: true,
            crypto: WETH,
            fiat: 43,
            price: 100,
            min: 1000,
            max: 5000,
            deliveryMethod: 'invalid',
            paymentTimeLimit: 60,
            terms: 'No KYC'
        };

        await expect(market.offerCreate(params)).to.be.reverted;
    });
});
