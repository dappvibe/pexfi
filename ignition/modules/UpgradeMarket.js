const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat");

module.exports = buildModule('UpgradeMarket', (m) => {
    const contracts = require('../deployments/chain-31337/deployed_addresses.json');
    //const Market = m.contractAt('Market', contracts['Market#Market']);
    const proxy  = m.contractAt('Market', contracts['Market#ERC1967Proxy']);

    const newMarket = m.contract('Market', [], {id: 'Market_0_0_1'});
    m.call(proxy, 'upgradeToAndCall', [
        newMarket,
        m.encodeFunctionCall(
            newMarket,
            'initialize',
            [contracts['RepToken#RepToken'], contracts['Inventory#Inventory']]
        )]);

    return { newMarket };
});
