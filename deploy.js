const {ethers} = require("ethers");
const {ethers: ethersHardhat, upgrades } = require("hardhat");
const fs = require('fs');
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/96a7c702b9c247f7a37a2b81a49bd4f9');
const pkey = fs.readFileSync('wallet.key', 'utf8');
const signer = new ethers.Wallet(pkey.trim(), provider);

const ETH_ARBITRUM = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
const UNISWAP_FACTORY_SEPOLIA = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c';

(async function deployPriceOracle() {
    const PriceOracleFactory = await ethersHardhat.getContractFactory("PriceOracle");
    const factory = new ethers.ContractFactory(PriceOracleFactory.interface, PriceOracleFactory.bytecode, signer);
    const priceOracle = await factory.deploy(UNISWAP_FACTORY_SEPOLIA);
    await priceOracle.waitForDeployment();
    console.log(priceOracle.target);
})();

(async function deploy() {
    const MarketFactory = await ethers.getContractFactory("Market", signer);
    const market = await upgrades.deployProxy(MarketFactory, [signer.address]);
    await market.waitForDeployment();
    console.log("Market deployed to:", await market.getAddress());
})();
