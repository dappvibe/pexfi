const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const deployRepToken = async function deployRepToken() {
    const RepToken = await ethers.getContractFactory("RepToken");
    return await upgrades.deployProxy(RepToken);
}
module.exports = { deployRepToken };

describe("RepToken", function(){
    let repToken, deployer, seller, buyer, coolhacker;

    before(async function() {
        [deployer, seller, buyer, coolhacker] = await ethers.getSigners();
        repToken = await deployRepToken();
    });

    describe('deploy', function() {
        it("is upgradable", async function() {
            const RepTokenFactory = await ethers.getContractFactory("RepToken");
            const newRepToken = await upgrades.upgradeProxy(await repToken.getAddress(), RepTokenFactory);
        });

        it('deployer is admin', async function() {
            expect(repToken.hasRole('DEFAULT_ADMIN_ROLE', deployer.address))
                .to.eventually.true;
            expect(repToken.hasRole('DEFAULT_ADMIN_ROLE', coolhacker.address))
                .to.eventually.false;
        });

        it('grant deployer MARKET_ROLE', async function() {
            await repToken.grantRole(ethers.id('MARKET_ROLE'), deployer.address);
            await expect(repToken.hasRole(ethers.id('MARKET_ROLE'), deployer.address)).to.eventually.true;
        });
    });

    describe('Registration', function() {
        it ('anyone can mint new profile', async function() {
            await repToken.connect(seller).register();
            expect(repToken.balanceOf(seller.address)).to.eventually.eq(1);
            await repToken.connect(buyer).register();
            expect(repToken.balanceOf(buyer.address)).to.eventually.eq(1);
            await repToken.connect(coolhacker).register();
            expect(repToken.balanceOf(coolhacker.address)).to.eventually.eq(1);
        });
    });

    describe('Market stats', function() {
        it('increase deal count', async function() {
            repToken = await repToken.connect(deployer);
            await expect(repToken.statsDealCompleted([1, 2])).to.eventually.fulfilled;
            const stats = await repToken.stats(1);
            expect(stats.dealsCompleted).to.eq(1);
        });
    });
});
