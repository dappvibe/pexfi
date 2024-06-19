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

    it('Creates offer', async function() {
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
});
