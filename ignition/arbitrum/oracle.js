const {ethers} = require("ethers");
const {askKey, deployPriceOracle} = require("../functions");

const RPC = 'https://arb1.arbitrum.io/rpc';

askKey(function(pkey) {
    const provider = new ethers.JsonRpcProvider(RPC);
    const wallet = new ethers.Wallet(pkey, provider);
    console.log('Deploying to ' + RPC);
    console.log('Deployer:', wallet.address);

    const uniswap = require('./constants/uniswap.json')['factory'];
    const tokens  = require('./constants/tokens.json');
    deployPriceOracle(wallet, uniswap, tokens).then(oracle => {
        console.log('Price oracle deployed to:', oracle.target);
    });
});
