import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { ethers } from 'ethers'
import OfferFactoryModule from './OfferFactory.ts'
import DealFactoryModule from './DealFactory.ts'
import RepTokenModule from './RepToken.ts'

export default buildModule('Market', (m) => {
  const { OfferFactory } = m.useModule(OfferFactoryModule)
  const { DealFactory } = m.useModule(DealFactoryModule)
  const { RepToken } = m.useModule(RepTokenModule)
  const uniswap = m.getParameter('uniswap') // factory (or mock) address

  // deploy
  const impl = m.contract('Market', [], { id: 'V0' })
  const proxy = m.contract('ERC1967Proxy', [
    impl,
    m.encodeFunctionCall(impl, 'initialize', [OfferFactory, DealFactory, RepToken, uniswap]),
  ])
  const Market = m.contractAt('Market', proxy)

  // post-deploy data population
  m.call(Market, 'addTokens', [m.getParameter('addTokens_0'), m.getParameter('addTokens_1')])
  m.call(Market, 'addFiats', [m.getParameter('fiats')])
  m.call(Market, 'addMethods', [m.getParameter('methods')])

  // link it all together
  m.call(OfferFactory, 'initialize', [Market])
  m.call(DealFactory, 'initialize', [Market])
  m.call(RepToken, 'grantRole', [ethers.encodeBytes32String('MARKET_ROLE'), proxy])

  return { Market, OfferFactory, DealFactory, RepToken }
})
