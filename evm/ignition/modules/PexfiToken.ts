import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PexfiToken", (m) => {
    const pexfi = m.contract("PexfiToken", []);

    return { pexfi };
});
