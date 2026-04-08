import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { parseEther } from 'viem'

/**
 * This module performs a buyback of PEXFI tokens from the Uniswap v4 pool.
 * It uses a standalone action contract to perform the swap in a single transaction.
 */
export default buildModule('BuyPexfi', (m) => {
  const amount = parseEther('0.0003')
  const pexfi = m.getParameter('pexfi_address', '0xCCA91e36E5c15163C5258832C57774072Db257C5')
  const universalRouter = m.getParameter('uniswapUniversalRouter')

  // Deploy the action contract
  const action = m.contract('PexfiBuybackAction')

  // Execute the buyback
  m.call(action, 'run', [universalRouter, pexfi], {
    id: 'buybackPexfi',
    value: amount,
  })

  return { action }
})
