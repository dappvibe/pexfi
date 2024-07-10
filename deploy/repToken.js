const { ethers, defender } = require("hardhat");

async function main() {
    const RepToken = await ethers.getContractFactory("RepToken");
    const repToken = await defender.deployProxy(RepToken, []);
    await repToken.waitForDeployment();
    console.log("Deployed to:", await repToken.getAddress());
}

main();
