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

    const proxy = await hre.ethers.getContractAt('OfferFactory', contracts['OfferFactory#ERC1967Proxy']);
    const OfferFactory = await hre.ethers.getContractFactory('OfferFactory');
    const newOfferFactory = await OfferFactory.deploy();

    const tx = await proxy.upgradeToAndCall(newOfferFactory.target, '0x');
    await tx.wait();

    console.log('New implementation:', newOfferFactory.target);

    await hre.run("verify", {
        address: newOfferFactory.target,
        constructorArguments: [],
    });

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
