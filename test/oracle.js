const {ethers} = require('ethers');

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/96a7c702b9c247f7a37a2b81a49bd4f9');
const ADDRESS = '0x973436F4377b4512FbFB0Bdd5C62e60d04d9D97d';
const ABI = '[{"inputs":[{"internalType":"address","name":"uniswapV3Factory_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address[]","name":"path_","type":"address[]"},{"internalType":"uint24[]","name":"fees_","type":"uint24[]"},{"internalType":"uint128","name":"amount_","type":"uint128"},{"internalType":"uint32","name":"period_","type":"uint32"}],"name":"getPriceOfTokenInToken","outputs":[{"internalType":"uint128","name":"","type":"uint128"},{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"uniswapV3Factory","outputs":[{"internalType":"contract IUniswapV3Factory","name":"","type":"address"}],"stateMutability":"view","type":"function"}]';

const oracle = new ethers.Contract(ADDRESS, ABI, provider);

const path = ['0xD74FDfaBbbfE724c2Dc2324d4EC3289DB26b48c5', '0xdAC17F958D2ee523a2206206994597C13D831ec7'];
//const path = ['0xBB1f6cC58152b81De0744B753c70e271450C876b', '0xdE235C6A3E8816c61E06f2F654a8B2CE75f02bE1'];

oracle.getPriceOfTokenInToken(path, [10000], 1**18, 1).then(result => {
    console.log(result);
});
