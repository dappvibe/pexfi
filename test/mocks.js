const {ethers} = require("hardhat");

async function deployMockERC20(...args) {
    return (await ethers.getContractFactory("MockERC20")).deploy(...args);
}

module.exports = { deployMockERC20 };
