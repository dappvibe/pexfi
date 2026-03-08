import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './01_Market'

export default buildModule('updateMarket', (m) => {
  // We reuse the existing Market deployment to get the proxy address and Finder
  const { Market } = m.useModule(MarketModule)

  // Deploy the new implementation of the Market contract.
  // We pass the same USDC address as in the initial deployment.
  const usdc = m.getParameter('usdc')
  const newImpl = m.contract('Market', [usdc])

  // Upgrade the proxy to the new implementation.
  // '0x' means no additional initialization call is performed.
  // If you need to call a re-initializer (e.g. __init_v2), change '0x' to:
  // m.encodeFunctionCall(newImpl, 'reinitializer_function_name', [arg1, arg2])
  m.call(Market, 'upgradeToAndCall', [newImpl, '0x'])

  return { Market }
})
