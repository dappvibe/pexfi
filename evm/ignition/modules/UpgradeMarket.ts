import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './Market.ts'

export default buildModule('UpgradeMarket', (m) => {
  const { Market } = m.useModule(MarketModule)

  // Deploy the new implementation
  const newImpl = m.contract('Market', [], { id: 'MarketImplV2' })

  // Upgrade the proxy to the new implementation
  m.call(Market, 'upgradeToAndCall', [newImpl, '0x'])

  return { Market }
})
