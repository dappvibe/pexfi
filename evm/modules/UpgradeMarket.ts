import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('UpgradeMarket', (m) => {
  // Deploy the new implementation
  const newImpl = m.contract('Market', [], { id: 'MarketImplV2' })

  // Upgrade the proxy to the new implementation
  const Market = m.contractAt('Market', m.getParameter('marketAddress'))
  m.call(Market, 'upgradeToAndCall', [newImpl, '0x'])

  return { Market }
})
