import { Method } from './hooks/useInventory'

/**
 * Decodes a bitmask of methods into a comma-separated string of method names.
 * 
 * @param mask The bitmask from the contract/subgraph
 * @param methods The record of methods from useInventory
 * @returns Comma-separated names or the original mask as string if not found
 */
export function decodeMethod(mask: any, methods: Record<string, Method>): string {
  if (!mask) return ''
  
  const m = BigInt(mask)
  const found = Object.values(methods)
    .filter((method) => (m & (1n << BigInt(method.index))) !== 0n)
    .map((method) => method.name)

  return found.length > 0 ? found.join(', ') : mask.toString()
}
