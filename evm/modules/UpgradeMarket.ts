import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './01_Market'

export default buildModule('UpgradeMarket', (m) => {
  const { Finder } = m.useModule(MarketModule)

  // Deploy the new implementation
  const newImpl = m.contract('Market', [], { id: 'MarketImplV2' })

  // Upgrade the proxy to the new implementation
  const Market = m.contractAt('Market', m.getParameter('marketAddress'))
  m.call(Market, 'upgradeToAndCall', [newImpl, m.encodeFunctionCall(newImpl, '__init_v2', [Finder])])

  return { Market }
})
