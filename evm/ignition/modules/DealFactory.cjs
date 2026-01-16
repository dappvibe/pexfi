const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DealFactoryModule = buildModule('DealFactory', m => {
    const impl = m.contract('DealFactory', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        '0x'    // initialize later
    ]);
    const DealFactory = m.contractAt('DealFactory', proxy);

    return { DealFactory };
});

module.exports = DealFactoryModule
