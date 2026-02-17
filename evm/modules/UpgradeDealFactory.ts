import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import CoreModule from './01_Core'

export default buildModule('UpgradeDealFactory', (m) => {
  const { DealFactory } = m.useModule(CoreModule)

  // Deploy the new implementation
  const newImpl = m.contract('DealFactory', [], { id: 'DealFactoryImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(DealFactory, 'upgradeToAndCall', [newImpl, '0x'])

  return { DealFactory }
})
