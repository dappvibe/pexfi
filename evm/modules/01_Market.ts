import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { zeroAddress, stringToHex, padHex, ethAddress } from 'viem'

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

const bytes32 = (s: string) => padHex(stringToHex(s), { size: 32, dir: 'right' })
const bytes16 = (s: string) => padHex(stringToHex(s), { size: 16, dir: 'right' })
const bytes3 = (s: string) => padHex(stringToHex(s), { size: 3, dir: 'right' })

export default buildModule('Market', (m) => {
  const Finder = m.contract('Finder')

  // --- Marketplace ---
  const OfferImplementation = m.contract('Offer', [Finder], { id: 'OfferImplementation' })
  const DealImplementation = m.contract('Deal', [Finder], { id: 'DealImplementation' })

  const ProfileImpl = m.contract('Profile', [], { id: 'ProfileV0' })
  const ProfileProxy = m.contract('ERC1967Proxy', [ProfileImpl, m.encodeFunctionCall(ProfileImpl, 'initialize', [])], {
    id: 'ProfileProxy',
  })
  const Profile = m.contractAt('Profile', ProfileProxy)

  // deploy
  const usdc = m.getParameter('usdc')
  const MarketImpl = m.contract('Market', [usdc, Finder], { id: 'MarketV0' })
  const MarketProxy = m.contract(
    'ERC1967Proxy',
    [MarketImpl, m.encodeFunctionCall(MarketImpl, 'initialize', [])],
    { id: 'MarketProxy' }
  )
  const Market = m.contractAt('Market', MarketProxy)

  // post-deploy data population
  m.call(Market, 'addToken', [
    m.getParameter('weth_address'),
    { decimals: 18, pool: m.getParameter('weth_pool') },
  ], { id: 'WETH' })
  m.call(Market, 'addToken', [
      m.getParameter('usdc'),
      { decimals: 6, pool: ethAddress }, // any non-zero pool, USDC is never converted
    ],
    { id: 'USDC' }
  )
  // any non-zero address just to register entry, USD is never converted
  m.call(Market, 'addFiat', [bytes3('USD'), ethAddress], { id: 'USD' })
  m.call(Market, 'addFiat', [bytes3('EUR'), m.getParameter('eur_chainlink')], { id: 'EUR' })
  m.call(Market, 'addMethods', [[bytes16('Bank Transfer')]])

  // link it all together via Finder
  m.call(Finder, 'changeImplementationAddress', [bytes32('OfferImplementation'), OfferImplementation], {
    id: 'regOfferImplementation',
  })
  m.call(Finder, 'changeImplementationAddress', [bytes32('DealImplementation'), DealImplementation], {
    id: 'regDealImplementation',
  })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Market'), Market], { id: 'regMarket' })
  m.call(Finder, 'changeImplementationAddress', [bytes32('Profile'), Profile], { id: 'regProfile' })

  // --- Tokenomics ---
  const pexfi = m.contract('PexfiToken', [])
  const pexfiVault = m.contract('PexfiVault', [pexfi])
  const regPexfiVault = m.call(Finder, 'changeImplementationAddress', [bytes32('PexfiVault'), pexfiVault], {
    id: 'regPexfiVault',
  })
  const beneficiary = m.getAccount(0)
  const startTimestamp = 1772864758 // mar 7
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

  const feeCollector = m.contract('FeeCollector', [
    pexfiVault,
    pexfi,
    universalRouter,
    m.getParameter('weth_address'),
    [zeroAddress, pexfi, 3000, 60, zeroAddress],
  ])
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
    OfferImplementation,
    DealImplementation,
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
