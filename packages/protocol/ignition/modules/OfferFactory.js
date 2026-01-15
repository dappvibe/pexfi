const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const OfferFactoryModule = buildModule('OfferFactory', m => {
    const impl = m.contract('OfferFactory', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        '0x'    // initialize later
    ]);
    const OfferFactory = m.contractAt('OfferFactory', proxy);

    return { OfferFactory };
});

module.exports = OfferFactoryModule
