import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { zeroAddress, parseEther } from 'viem'
import MarketModule from './01_Market'

/**
 * This module performs a buyback of PEXFI tokens from the Uniswap v4 pool.
 * It sends 0.0003 ETH to the FeeCollector contract.
 * This ensures there is liquidity on both sides of the pool and makes it active.
 */
export default buildModule('BuyPexfi', (m) => {
  const { feeCollector } = m.useModule(MarketModule)

  const amount = parseEther('0.0003')

  // Call buyback(address token, uint24 fee)
  // For Native ETH (zeroAddress), the fee parameter is ignored in the initial stage of buyback.
  m.call(feeCollector, 'buyback', [zeroAddress, 0], {
    id: 'buybackPexfi',
    value: amount,
  })

  return { feeCollector }
})
