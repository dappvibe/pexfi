import hre from 'hardhat'
import fs from 'fs'
import path from 'path'
import { ethAddress } from 'viem'
import MocksModule from '../modules/00_MockDependencies'

/**
 * This script queries Ignition for already deployed mock addresses
 * and generates evm/ignition/parameters/localhost.json
 */
async function main() {
  const { ignition } = await hre.network.connect()
  console.log(`Querying Ignition for deployed mocks on network: ${hre.network.name}...`)

  // ignition.deploy() will return already deployed contracts if they exist in the deployment cache
  // and haven't changed. This is the "query" mechanism for Ignition.
  const mocks: any = await ignition.deploy(MocksModule)

  const params = {
    Market: {
      ContinuousClearingAuctionFactory: ethAddress, // placeholder
      uniswapUniversalRouter: mocks.universalRouter.address,
      weth_address: mocks.WETH.address,
      weth_pool: mocks.poolETH.address,
      usdc: mocks.USDC.address,
      eur_chainlink: mocks.EUR.address,
    },
  }

  const outputPath = path.join(process.cwd(), 'evm', 'ignition', 'parameters', 'localhost.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(params, null, 2))

  console.log(`Parameters saved to ${outputPath}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
