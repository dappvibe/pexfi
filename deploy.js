const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/96a7c702b9c247f7a37a2b81a49bd4f9');

const pkey = fs.readFileSync('wallet.key', 'utf8');

(async function deploy() {
    const signer = new ethers.Wallet(pkey.trim(), provider);
    const MarketFactory = await ethers.getContractFactory("Market", signer);
    const market = await upgrades.deployProxy(MarketFactory, [signer.address]);
    await market.waitForDeployment();
    console.log("Market deployed to:", await market.getAddress());
})();
