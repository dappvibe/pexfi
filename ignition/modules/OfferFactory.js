const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const OfferFactoryModule = buildModule('OfferFactory', m => {
    const OfferFactory = m.contract('OfferFactory');
    // TODO set market address with initialize()

    return { OfferFactory };
});

module.exports = OfferFactoryModule
