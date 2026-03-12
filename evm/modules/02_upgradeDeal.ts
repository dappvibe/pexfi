import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { padHex, stringToHex } from 'viem'

import MarketModule from './01_Market'

const bytes32 = (s: string) => padHex(stringToHex(s), { size: 32, dir: 'right' })

export default buildModule('UpgradeDeal', (m) => {
  const { Finder } = m.useModule(MarketModule)

  const NewDealImplementation = m.contract('Deal', [], { id: 'NewDealImplementation' })

  m.call(Finder, 'changeImplementationAddress', [bytes32('DealImplementation'), NewDealImplementation], {
    id: 'upgradeDealImplementation',
  })

  return { NewDealImplementation, Finder }
})
