import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { zeroAddress } from 'viem'
import { ethers } from 'ethers'

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

export default buildModule('Market', (m) => {
  const Finder = m.contract('Finder')

  // --- Marketplace ---
  const OfferImplementation = m.contract('Offer', [], { id: 'OfferImplementation' })
  const OfferFactory = m.contract('OfferFactory', [Finder], { id: 'OfferFactory' })
  m.call(OfferFactory, 'setImplementation', [OfferImplementation])

  const DealImplementation = m.contract('Deal', [], { id: 'DealImplementation' })
  const DealFactory = m.contract('DealFactory', [Finder], { id: 'DealFactory' })
  m.call(DealFactory, 'setImplementation', [DealImplementation])

  const ProfileImpl = m.contract('Profile', [], { id: 'ProfileV0' })
  const ProfileProxy = m.contract('ERC1967Proxy', [ProfileImpl, m.encodeFunctionCall(ProfileImpl, 'initialize', [])], {
    id: 'ProfileProxy',
  })
  const Profile = m.contractAt('Profile', ProfileProxy)

  const uniswap = m.getParameter('uniswap') // factory (or mock) address

  // deploy
  const MarketImpl = m.contract('Market', [], { id: 'MarketV0' })
  const MarketProxy = m.contract(
    'ERC1967Proxy',
    [MarketImpl, m.encodeFunctionCall(MarketImpl, 'initialize', [Finder])],
    { id: 'MarketProxy' }
  )
  const Market = m.contractAt('Market', MarketProxy)

  // post-deploy data population
  m.call(Market, 'addTokens', [m.getParameter('addTokens_0'), m.getParameter('addTokens_1')])
  m.call(Market, 'addFiats', [m.getParameter('fiats')])
  m.call(Market, 'addMethods', [m.getParameter('methods')])

  // link it all together via Finder
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('OfferFactory'), OfferFactory], {
    id: 'regOfferFactory',
  })
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('DealFactory'), DealFactory], {
    id: 'regDealFactory',
  })
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Market'), Market], { id: 'regMarket' })
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Profile'), Profile], { id: 'regProfile' })
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Uniswap'), uniswap], { id: 'regUniswap' })
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Mediator'), m.getAccount(0)], { id: 'regMediator' })

  // Profile grants role to Market
  m.call(Profile, 'grantRole', [ethers.encodeBytes32String('MARKET_ROLE'), MarketProxy])

  // --- Tokenomics ---
  const pexfi = m.contract('PexfiToken', [])
  const pexfiVault = m.contract('PexfiVault', [pexfi])
  const beneficiary = m.getAccount(0)
  const startTimestamp = Math.floor(Date.now() / 1000)
  const pexfiVesting = m.contract('PexfiVesting', [beneficiary, startTimestamp, TWO_YEARS, SIX_MONTHS, pexfiVault])

  // Parameters needed for FeeCollector
  const universalRouter = m.getParameter('uniswapUniversalRouter')
  const weth = m.getParameter('weth')

  const feeCollector = m.contract('FeeCollector', [pexfiVault, pexfi, universalRouter, weth])
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('FeeCollector'), feeCollector], {
    id: 'regFeeCollector',
  })

  // --- Oracle Setup ---

  const Store = m.contract('Store', [{ rawValue: 0 }, { rawValue: 0 }, zeroAddress])
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Store'), Store], { id: 'setStore' })

  const IdentifierWhitelist = m.contract('IdentifierWhitelist', [])
  m.call(
    Finder,
    'changeImplementationAddress',
    [ethers.encodeBytes32String('IdentifierWhitelist'), IdentifierWhitelist],
    { id: 'idenitfierWhitelist' }
  )
  m.call(IdentifierWhitelist, 'addSupportedIdentifier', [ethers.encodeBytes32String('ASSERT_TRUTH')])

  const CollateralWhitelist = m.contract('AddressWhitelist', [])
  m.call(
    Finder,
    'changeImplementationAddress',
    [ethers.encodeBytes32String('CollateralWhitelist'), CollateralWhitelist],
    { id: 'collateralWhitelist' }
  )
  m.call(CollateralWhitelist, 'addToWhitelist', [pexfiVault])
  m.call(Store, 'setFinalFee', [pexfiVault, { rawValue: 0 }])

  // Placeholder Oracle address — syncUmaParams requires it at deploy time.
  // Re-registered to OOv3 after deployment below.
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Oracle'), Finder], {
    id: 'setOraclePlaceholder',
  })

  // Liveness 1 minute is set while having single arbitrator. Will be set to sensible value when DVM is decentralized.
  const OOv3 = m.contract('OptimisticOracleV3', [Finder, pexfiVault, 60])

  // Re-register Oracle to actual OOv3 address
  m.call(Finder, 'changeImplementationAddress', [ethers.encodeBytes32String('Oracle'), OOv3], { id: 'setOracle' })

  return {
    Market,
    OfferFactory,
    DealFactory,
    Profile,
    pexfi,
    pexfiVault,
    pexfiVesting,
    feeCollector,
    OOv3,
    Finder,
    Store,
    IdentifierWhitelist,
    CollateralWhitelist,
  }
})
