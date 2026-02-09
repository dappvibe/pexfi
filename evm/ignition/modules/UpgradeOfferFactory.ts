import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import OfferFactoryModule from './OfferFactory.ts'

export default buildModule('UpgradeOfferFactory', (m) => {
  const { OfferFactory } = m.useModule(OfferFactoryModule)

  // Deploy the new implementation
  const newImpl = m.contract('OfferFactory', [], { id: 'OfferFactoryImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(OfferFactory, 'upgradeToAndCall', [newImpl, '0x'])

  return { OfferFactory }
})
