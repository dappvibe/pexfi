import { useReadContracts } from 'wagmi'
import { bytesToString, hexToBytes } from 'viem'
import { marketAbi } from '@/wagmi'
import { useAddress } from '@/hooks/useAddress'

export function useInventory() {
  const address = useAddress('Market#Market')

  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      { address, abi: marketAbi, functionName: 'getTokens' },
      { address, abi: marketAbi, functionName: 'getFiats' },
      { address, abi: marketAbi, functionName: 'getMethods' },
    ],
    query: {
      staleTime: Infinity, // reload page to refresh
      enabled: !!address,
      select: (data) => {
        const [tokensRaw, fiatsRaw, methodsRaw] = data as [any[], string[], any[]]

        const tokens = tokensRaw.reduce(
          (acc, token) => {
            acc[token.symbol] = token
            return acc
          },
          {} as Record<string, any>
        )

        const fiats = fiatsRaw.map((f) => bytesToString(hexToBytes(f), { size: 32 }))

        const methods = methodsRaw.reduce(
          (acc, method) => {
            acc[method.name] = method
            return acc
          },
          {} as Record<string, any>
        )

        return { tokens, fiats, methods }
      },
    },
  })

  return (
    data || {
      tokens: {},
      fiats: [],
      methods: {},
    }
  )
}
