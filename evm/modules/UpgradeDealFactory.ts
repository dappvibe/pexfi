import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import DealFactoryModule from './DealFactory.ts'

export default buildModule('UpgradeDealFactory', (m) => {
  const { DealFactory } = m.useModule(DealFactoryModule)

  // Deploy the new implementation
  const newImpl = m.contract('DealFactory', [], { id: 'DealFactoryImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(DealFactory, 'upgradeToAndCall', [newImpl, '0x'])

  return { DealFactory }
})
