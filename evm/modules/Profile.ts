import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('Profile', (m) => {
    const impl = m.contract('Profile', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        m.encodeFunctionCall(impl, 'initialize', [])
    ]);
    const Profile = m.contractAt('Profile', proxy);

    return { Profile };
});
