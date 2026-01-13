import { useMemo } from 'react'
import { useReadContracts, useWatchContractEvent } from 'wagmi'
import { Address } from 'viem'
import { offerAbi } from '@/wagmi'
import { useInventory } from '@/hooks/useInventory'

export type Token = {
  address: Address
  name: string
  symbol: string
  decimals: number
}

export type Offer = {
  address: Address
  owner: Address
  isSell: boolean
  tokenId: number
  token: Token | null
  fiat: string
  method: string
  rate: bigint
  minFiat: number
  maxFiat: number
  terms: string
  disabled: boolean
}

export function useOffer(address: Address | undefined) {
  const { tokens } = useInventory()
  const offerContract = address ? ({ address, abi: offerAbi } as const) : null

  const { data: offerData, isLoading, error, refetch } = useReadContracts({
    contracts: offerContract
      ? [
          { ...offerContract, functionName: 'owner' },
          { ...offerContract, functionName: 'isSell' },
          { ...offerContract, functionName: 'token' },
          { ...offerContract, functionName: 'fiat' },
          { ...offerContract, functionName: 'method' },
          { ...offerContract, functionName: 'rate' },
          { ...offerContract, functionName: 'limits' },
          { ...offerContract, functionName: 'terms' },
          { ...offerContract, functionName: 'disabled' },
        ]
      : [],
    query: { enabled: !!address },
  })

  const offer = useMemo<Offer | null>(() => {
    if (!offerData || !address || offerData.some((d) => d.status === 'failure')) return null

    const limitsResult = offerData[6].result as readonly [number, number] | undefined
    const tokenSymbol = offerData[2].result as string
    const tokenFromInventory = tokens[tokenSymbol]

    return {
      address,
      owner: offerData[0].result as Address,
      isSell: offerData[1].result as boolean,
      tokenId: tokenFromInventory?.id ?? 0,
      token: tokenFromInventory
        ? {
            address: tokenFromInventory.api as Address,
            name: tokenFromInventory.name,
            symbol: tokenFromInventory.symbol,
            decimals: tokenFromInventory.decimals,
          }
        : null,
      fiat: offerData[3].result as string,
      method: offerData[4].result as string,
      rate: BigInt(offerData[5].result as number),
      minFiat: limitsResult ? Number(limitsResult[0]) : 0,
      maxFiat: limitsResult ? Number(limitsResult[1]) : 0,
      terms: offerData[7].result as string,
      disabled: offerData[8].result as boolean,
    }
  }, [offerData, tokens, address])

  useWatchContractEvent({
    address,
    abi: offerAbi,
    eventName: 'OfferUpdated',
    onLogs: () => refetch(),
    enabled: !!address,
  })

  return { offer, isLoading, error, refetch }
}
