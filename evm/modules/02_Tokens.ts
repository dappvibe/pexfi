import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import CoreModule from './01_Core'

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60
const TWO_YEARS = 2 * 365 * 24 * 60 * 60

export default buildModule('Tokens', (m) => {
  const { pexfiVault } = m.useModule(CoreModule)

  const beneficiary = m.getAccount(0)
  const startTimestamp = Math.floor(Date.now() / 1000)
  const pexfiVesting = m.contract('PexfiVesting', [beneficiary, startTimestamp, TWO_YEARS, SIX_MONTHS, pexfiVault])

  return { pexfiVesting }
})
