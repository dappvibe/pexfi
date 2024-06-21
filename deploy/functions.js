const {ethers} = require("ethers");
const {ethers: ethersHardhat, upgrades } = require("hardhat");

const ETH_ARBITRUM = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
const UNISWAP_FACTORY_SEPOLIA = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c';

async function deployPriceOracle(wallet, uniswapAddress, tokens) {
    const PriceOracleFactory = await ethersHardhat.getContractFactory("PriceOracle");
    const factory = new ethers.ContractFactory(PriceOracleFactory.interface, PriceOracleFactory.bytecode, wallet);
    const priceOracle = await factory.deploy(uniswapAddress, Object.keys(tokens), Object.values(tokens));
    await priceOracle.waitForDeployment();
    console.log(priceOracle.target);
    return priceOracle;
}

async function deploy() {
    const MarketFactory = await ethers.getContractFactory("Market", signer);
    const market = await upgrades.deployProxy(MarketFactory, [signer.address]);
    await market.waitForDeployment();
    console.log("Market deployed to:", await market.getAddress());
}

function askKey(callback) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter deployer key: ', callback);
}

module.exports = {
    askKey: askKey,
    deployPriceOracle: deployPriceOracle,
}
