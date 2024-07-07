const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DealFactoryModule = buildModule('DealFactory', m => {
    const DealFactory = m.contract('DealFactory');
    // TODO set market address with initialize()

    return { DealFactory };
});

module.exports = DealFactoryModule
