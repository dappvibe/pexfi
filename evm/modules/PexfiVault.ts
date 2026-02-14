import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import PexfiTokenModule from "./PexfiToken";

export default buildModule("PexfiVault", (m) => {
    const { pexfi } = m.useModule(PexfiTokenModule);

    const pexfiVault = m.contract("PexfiVault", [pexfi]);

    return { pexfiVault };
});
