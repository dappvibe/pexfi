import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import PexfiTokenModule from "./PexfiToken";
import PexfiVaultModule from "./PexfiVault";

export default buildModule("FeeCollector", (m) => {
  const { pexfi } = m.useModule(PexfiTokenModule)
  const { pexfiVault } = m.useModule(PexfiVaultModule)

  // Parameters needed for FeeCollector
  const universalRouter = m.getParameter('uniswapUniversalRouter')
  const weth = m.getParameter('weth')
  const marketAddress = m.getParameter('marketAddress')

  const feeCollector = m.contract('FeeCollector', [pexfiVault, pexfi, universalRouter, weth])

  // Set FeeCollector on Market
  const Market = m.contractAt('Market', marketAddress)
  m.call(Market, 'setFeeCollector', [feeCollector])

  return { feeCollector }
});
