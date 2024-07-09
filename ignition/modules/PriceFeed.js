const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");

// used in tests  to deploy limited amount of fiat oracles
module.exports = buildModule('PriceFeed', (m) => {
    const currency = m.getParameter('currency');
    const PriceFeed = m.contract(
        `PriceFeed`,
        [currency],
    )

    return { PriceFeed };
});
