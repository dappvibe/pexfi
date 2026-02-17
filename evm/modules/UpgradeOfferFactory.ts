import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './01_Market'

export default buildModule('UpgradeOfferFactory', (m) => {
  const { OfferFactory, Finder } = m.useModule(MarketModule)

  // Deploy the new implementation
  const newImpl = m.contract('OfferFactory', [], { id: 'OfferFactoryImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(OfferFactory, 'upgradeToAndCall', [newImpl, m.encodeFunctionCall(newImpl, '__init_v2', [Finder])])

  return { OfferFactory }
})
