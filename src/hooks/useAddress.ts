import { useChainId } from 'wagmi'

// Eagerly load all deployed_addresses.json files
// Keys will be relative to project root or this file
const deployments = import.meta.glob('@deployments/**/deployed_addresses.json', { eager: true, import: 'default' })

export function useAddress(contractName: string) {
  const chainId = useChainId()

  // Find the deployment file for the current chain
  // Expected path format: .../chain-<chainId>/deployed_addresses.json
  const key = Object.keys(deployments).find((k) => k.includes(`chain-${chainId}/deployed_addresses.json`))

  if (!key) {
    console.warn(`No deployments found for chain ${chainId}`)
    return undefined
  }

  const addresses = deployments[key] as Record<string, string>
  return addresses[contractName] as `0x${string}`
}
