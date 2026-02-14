import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import ProfileModule from './Profile.ts'

export default buildModule('UpgradeProfile', (m) => {
  const { Profile } = m.useModule(ProfileModule)

  // Deploy the new implementation
  const newImpl = m.contract('Profile', [], { id: 'ProfileImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(Profile, 'upgradeToAndCall', [newImpl, '0x'])

  return { Profile }
})
