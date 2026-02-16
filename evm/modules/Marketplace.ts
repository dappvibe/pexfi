import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import MarketModule from './Market'
import TruthMachineModule from './TruthMachine'

export default buildModule('Marketplace', (m) => {
  const { Market, OfferFactory, DealFactory, Profile } = m.useModule(MarketModule)
  const { OOv3 } = m.useModule(TruthMachineModule)

  m.call(Market, 'setOracle', [OOv3], { id: 'setOracle' })

  return { Market, OfferFactory, DealFactory, Profile, OOv3 }
})
