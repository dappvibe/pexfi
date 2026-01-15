const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

async function main() {
    const chainId = await hre.ethers.provider.getNetwork().then(network => network.chainId);
    const addressesPath = path.join(__dirname, `./deployments/chain-${chainId}/deployed_addresses.json`);
    if (!fs.existsSync(addressesPath)) {
        throw new Error(`Addresses file not found for chain ID ${chainId}`);
    }
    const contracts = require(addressesPath);

    const proxy = await hre.ethers.getContractAt('DealFactory', contracts['DealFactory#ERC1967Proxy']);
    const DealFactory = await hre.ethers.getContractFactory('DealFactory');
    const newDealFactory = await DealFactory.deploy();

    const tx = await proxy.upgradeToAndCall(newDealFactory.target, '0x');
    await tx.wait();

    console.log('New implementation:', newDealFactory.target);

    await hre.run("verify", {
        address: newDealFactory.target,
        constructorArguments: [],
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
