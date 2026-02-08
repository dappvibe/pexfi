import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Mock", (m) =>
{
    const tokens = {};
    for (const token of [ ['WBTC', 8], ['WETH', 18], ['USDT', 6] ]) {
        tokens[token[0]] = m.contract('MockERC20', [token[0], token[1]], {id: token[0]});
    }

    const uniswap = m.contract('MockUniswapV3Factory', []);
    m.call(uniswap, 'setPool', [tokens['WBTC'], m.contract('PoolBTC')], {id: 'poolBTC'});
    m.call(uniswap, 'setPool', [tokens['WETH'], m.contract('PoolETH')], {id: 'poolWETH'});

    return { uniswap, ...tokens };
});
