import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { ethers } from 'ethers'
import TokenomicsModule from './Tokenomics'

export default buildModule('TruthMachine', (m) => {
  const { pexfiVault } = m.useModule(TokenomicsModule)

  const Finder = m.contract('Finder', [])

  const Store = m.contract('Store', [
    { rawValue: 0 },
    { rawValue: 0 },
    ethers.ZeroAddress,
  ])

  const IdentifierWhitelist = m.contract('IdentifierWhitelist', [])

  const CollateralWhitelist = m.contract('AddressWhitelist', [])

  // Register interfaces in Finder (OOv3 constructor calls syncUmaParams which reads these)
  m.call(Finder, 'changeImplementationAddress', [
    ethers.encodeBytes32String('Store'),
    Store,
  ], { id: 'Finder_setStore' })

  m.call(Finder, 'changeImplementationAddress', [
    ethers.encodeBytes32String('IdentifierWhitelist'),
    IdentifierWhitelist,
  ], { id: 'Finder_setIdentifierWhitelist' })

  m.call(Finder, 'changeImplementationAddress', [
    ethers.encodeBytes32String('CollateralWhitelist'),
    CollateralWhitelist,
  ], { id: 'Finder_setCollateralWhitelist' })

  // Placeholder Oracle address — syncUmaParams requires it at deploy time.
  // Re-registered to OOv3 after deployment below.
  m.call(Finder, 'changeImplementationAddress', [
    ethers.encodeBytes32String('Oracle'),
    Finder,
  ], { id: 'Finder_setOraclePlaceholder' })

  // Whitelist ASSERT_TRUTH identifier
  m.call(IdentifierWhitelist, 'addSupportedIdentifier', [
    ethers.encodeBytes32String('ASSERT_TRUTH'),
  ])

  // Whitelist sPEXFI as collateral
  m.call(CollateralWhitelist, 'addToWhitelist', [pexfiVault])

  // Set finalFee for sPEXFI to 0
  m.call(Store, 'setFinalFee', [pexfiVault, { rawValue: 0 }])

  // Deploy OOv3: defaultCurrency = sPEXFI, defaultLiveness = 60s (1 minute)
  const OOv3 = m.contract('OptimisticOracleV3', [
    Finder,
    pexfiVault,
    60,
  ])

  // Re-register Oracle to actual OOv3 address
  m.call(Finder, 'changeImplementationAddress', [
    ethers.encodeBytes32String('Oracle'),
    OOv3,
  ], { id: 'Finder_setOracle' })

  return { OOv3, Finder, Store, IdentifierWhitelist, CollateralWhitelist }
})
