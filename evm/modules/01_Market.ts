import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { zeroAddress } from 'viem'
import { ethers } from 'ethers'

export default buildModule('Market', (m) => {
  // --- Marketplace ---
  const OfferFactoryImpl = m.contract('OfferFactory', [], { id: 'OfferFactoryV0' })
  const OfferFactoryProxy = m.contract(
    'ERC1967Proxy',
    [
      OfferFactoryImpl,
      '0x', // initialize later
    ],
    { id: 'OfferFactoryProxy' }
  )
  const OfferFactory = m.contractAt('OfferFactory', OfferFactoryProxy)

  const DealFactoryImpl = m.contract('DealFactory', [], { id: 'DealFactoryV0' })
  const DealFactoryProxy = m.contract(
    'ERC1967Proxy',
    [
      DealFactoryImpl,
      '0x', // initialize later
    ],
    { id: 'DealFactoryProxy' }
  )
  const DealFactory = m.contractAt('DealFactory', DealFactoryProxy)

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
    [MarketImpl, m.encodeFunctionCall(MarketImpl, 'initialize', [OfferFactory, DealFactory, Profile, uniswap])],
    { id: 'MarketProxy' }
  )
  const Market = m.contractAt('Market', MarketProxy)

  // post-deploy data population
  m.call(Market, 'addTokens', [m.getParameter('addTokens_0'), m.getParameter('addTokens_1')])
  m.call(Market, 'addFiats', [m.getParameter('fiats')])
  m.call(Market, 'addMethods', [m.getParameter('methods')])

  // link it all together
  m.call(OfferFactory, 'initialize', [Market])
  m.call(DealFactory, 'initialize', [Market])
  m.call(Profile, 'grantRole', [ethers.encodeBytes32String('MARKET_ROLE'), MarketProxy])

  // --- Tokenomics ---
  const pexfi = m.contract('PexfiToken', [])
  const pexfiVault = m.contract('PexfiVault', [pexfi])

  // Parameters needed for FeeCollector
  const universalRouter = m.getParameter('uniswapUniversalRouter')
  const weth = m.getParameter('weth')

  const feeCollector = m.contract('FeeCollector', [pexfiVault, pexfi, universalRouter, weth])

  // Set FeeCollector on Market
  m.call(Market, 'setFeeCollector', [feeCollector])

  // --- Oracle ---
  // part of OOv3
  const Finder = m.contract('Finder')

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
    feeCollector,
    OOv3,
    Finder,
    Store,
    IdentifierWhitelist,
    CollateralWhitelist,
  }
})
