const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PriceFeeds", (m) => {
    const currencies = require('../currencies.json');

    const fiats = {};
    currencies.forEach(currency => {
        if (currency.chainlink) return; // in production must pass chainlink address
        fiats[currency.code] = m.contract(`PriceFeed`, [currency.code], {id: currency.code});
    });

    return fiats;
});
