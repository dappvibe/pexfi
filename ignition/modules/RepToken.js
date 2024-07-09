const {buildModule} = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RepTokenModule", (m) => {
    const impl = m.contract('RepToken', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        m.encodeFunctionCall(impl, 'initialize', [])
    ]);
    const RepToken = m.contractAt('RepToken', proxy);

    return { RepToken };
});
