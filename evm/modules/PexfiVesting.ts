import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import PexfiVaultModule from './PexfiVault'

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

export default buildModule('PexfiVesting', (m) => {
  const beneficiary = m.getAccount(0)
  const startTimestamp = Math.floor(Date.now() / 1000)
  const { pexfiVault } = m.useModule(PexfiVaultModule)

  const pexfiVesting = m.contract('PexfiVesting', [
    beneficiary,
    startTimestamp,
    TWO_YEARS,
    SIX_MONTHS,
    pexfiVault,
  ])

  return { pexfiVesting }
})
