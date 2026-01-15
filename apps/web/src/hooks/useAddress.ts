import { useChainId } from 'wagmi'
import addresses from '@contracts/addresses.json'

type ContractName = keyof (typeof addresses)['31337']

export function useAddress(contractName: ContractName) {
  const chainId = useChainId()

  const chainDeployments = addresses[chainId.toString()]

  if (!chainDeployments) {
    console.warn(`No addresses found for chain ${chainId}`)
    return undefined
  }

  return chainDeployments[contractName] as `0x${string}`
}
