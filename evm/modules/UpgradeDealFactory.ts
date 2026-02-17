import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './01_Market'

export default buildModule('UpgradeDealFactory', (m) => {
  const { DealFactory, Finder } = m.useModule(MarketModule)

  // Deploy the new implementation
  const newImpl = m.contract('DealFactory', [], { id: 'DealFactoryImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(DealFactory, 'upgradeToAndCall', [newImpl, m.encodeFunctionCall(newImpl, '__init_v2', [Finder])])

  return { DealFactory }
})
