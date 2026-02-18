import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { zeroAddress, stringToHex } from 'viem'

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

const bytes32 = (s) => stringToHex(s, { size: 32 })

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
  m.call(Finder, 'changeImplementationAddress', [bytes32('OfferFactory'), OfferFactory], {
    id: 'regOfferFactory',
  })
  m.call(Finder, 'changeImplementationAddress', [bytes32('DealFactory'), DealFactory], {
    id: 'regDealFactory',
  })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Market'), Market], { id: 'regMarket' })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Profile'), Profile], { id: 'regProfile' })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Uniswap'), uniswap], { id: 'regUniswap' })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Mediator'), m.getAccount(0)], { id: 'regMediator' })

  // Profile grants role to Market
  m.call(Profile, 'grantRole', [bytes32('MARKET_ROLE'), MarketProxy])

  // --- Tokenomics ---
  const pexfi = m.contract('PexfiToken', [])
  const pexfiVault = m.contract('PexfiVault', [pexfi])
  const regPexfiVault = m.call(Finder, 'changeImplementationAddress', [bytes32('PexfiVault'), pexfiVault], { id: 'regPexfiVault' })
  const beneficiary = m.getAccount(0)
  const startTimestamp = Math.floor(Date.now() / 1000)
  const pexfiVesting = m.contract('PexfiVesting', [beneficiary, startTimestamp, TWO_YEARS, SIX_MONTHS, Finder], {
    after: [regPexfiVault],
  })

  const stakeAmount = 160_000n * 10n ** 18n
  const approveVault = m.call(pexfi, 'approve', [pexfiVault, stakeAmount], { id: 'approveVaultForStaking' })
  m.call(pexfiVault, 'deposit', [stakeAmount, pexfiVesting], {
    id: 'depositStake',
    after: [approveVault, pexfiVesting],
  })

  // Parameters needed for FeeCollector
  const universalRouter = m.getParameter('uniswapUniversalRouter')
  const weth = m.getParameter('weth')

  const feeCollector = m.contract('FeeCollector', [pexfiVault, pexfi, universalRouter, weth])
  m.call(Finder, 'changeImplementationAddress', [bytes32('FeeCollector'), feeCollector], {
    id: 'regFeeCollector',
  })

  // --- Oracle Setup ---

  const Store = m.contract('Store', [{ rawValue: 0 }, { rawValue: 0 }, zeroAddress])
  m.call(Finder, 'changeImplementationAddress', [bytes32('Store'), Store], { id: 'setStore' })

  const IdentifierWhitelist = m.contract('IdentifierWhitelist', [])
  m.call(Finder, 'changeImplementationAddress', [bytes32('IdentifierWhitelist'), IdentifierWhitelist], {
    id: 'idenitfierWhitelist',
  })
  m.call(IdentifierWhitelist, 'addSupportedIdentifier', [bytes32('ASSERT_TRUTH')])

  const CollateralWhitelist = m.contract('AddressWhitelist', [])
  m.call(Finder, 'changeImplementationAddress', [bytes32('CollateralWhitelist'), CollateralWhitelist], {
    id: 'collateralWhitelist',
  })
  m.call(CollateralWhitelist, 'addToWhitelist', [pexfiVault])
  // With OOv3 defaults (50% burn), Minimum Bond = Final Fee * 2 = 160,000 tokens.
  // This ensures only the deployer can assert/dispute initially.
  const initialFinalFee = 80_000n * 10n ** 18n
  m.call(Store, 'setFinalFee', [pexfiVault, { rawValue: initialFinalFee }])

  // Placeholder Oracle address — syncUmaParams requires it at deploy time.
  // Re-registered to OOv3 after deployment below.
  m.call(Finder, 'changeImplementationAddress', [bytes32('Oracle'), Finder], {
    id: 'setOraclePlaceholder',
  })

  // Liveness 1 minute is set while having single arbitrator. Will be set to sensible value when DVM is decentralized.
  const OOv3 = m.contract('OptimisticOracleV3', [Finder, pexfiVault, 60])

  // Re-register Oracle to actual OOv3 address
  m.call(Finder, 'changeImplementationAddress', [bytes32('Oracle'), OOv3], { id: 'setOracle' })

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
