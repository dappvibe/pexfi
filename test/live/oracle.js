const {ethers} = require("ethers");
const {ethers: hardhat} = require('hardhat');

(async function(){
    const factory = hardhat.getContractFactory('PriceOracle');
    const oracle = (await factory)
        .connect(new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'))
        .attach('0xc1ad82D4C198aEfAb32BeDB08285c6c5840844FA');

    oracle.getPriceOfTokenInToken(
        [
            //'0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
            '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'  // USDT
        ],
        [500], // 0.05%
        100000,
        300
    ).then(result => {
        // 63834383n, 300n
        console.log(result);
    });

})();
