const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const deployRepToken = async function deployRepToken() {
    const RepToken = await ethers.getContractFactory("RepToken");
    return await upgrades.deployProxy(RepToken);
}
module.exports = { deployRepToken };

describe("RepToken", function(){
    let repToken, deployer, coolhacker;

    before(async function() {
        [deployer, coolhacker] = await ethers.getSigners();
        repToken = await deployRepToken();
    });

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
});
