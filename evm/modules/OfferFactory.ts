import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule('OfferFactory', m => {
    const impl = m.contract('OfferFactory', [], {id: 'V0'});
    const proxy = m.contract('ERC1967Proxy', [
        impl,
        '0x'    // initialize later
    ]);
    const OfferFactory = m.contractAt('OfferFactory', proxy);

    return { OfferFactory };
});
