import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import CoreModule from './01_Core'

export default buildModule('UpgradeProfile', (m) => {
  const { Profile } = m.useModule(CoreModule)

  // Deploy the new implementation
  const newImpl = m.contract('Profile', [], { id: 'ProfileImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(Profile, 'upgradeToAndCall', [newImpl, '0x'])

  return { Profile }
})
