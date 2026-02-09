import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import RepTokenModule from './RepToken.ts'

export default buildModule('UpgradeRepToken', (m) => {
  const { RepToken } = m.useModule(RepTokenModule)

  // Deploy the new implementation
  const newImpl = m.contract('RepToken', [], { id: 'RepTokenImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(RepToken, 'upgradeToAndCall', [newImpl, '0x'])

  return { RepToken }
})
