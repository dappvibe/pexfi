import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RepToken", (m) => {
    const impl = m.contract('RepToken', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        m.encodeFunctionCall(impl, 'initialize', [])
    ]);
    const RepToken = m.contractAt('RepToken', proxy);

    return { RepToken };
});
