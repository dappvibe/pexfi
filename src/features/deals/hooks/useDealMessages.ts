import { useEffect, useState, useCallback } from 'react'
import { Address } from 'viem'
import { useChainId, usePublicClient, useWatchContractEvent } from 'wagmi'
import { dealAbi } from '@/wagmi'

export type Message = {
  sender: Address
  message: string
  timestamp: number
}

const blockHashCache = new Map<string, number>()

export function useDealMessages(address: Address | undefined) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages([])
  }, [chainId])

  const fetchLogs = useCallback(async () => {
    if (!address || !publicClient) return
    const logs = await publicClient.getLogs({
      address,
      event: {
        type: 'event',
        name: 'Message',
        inputs: [
          { type: 'address', name: 'sender', indexed: true },
          { type: 'string', name: 'message', indexed: false },
        ],
      },
      fromBlock: 'earliest',
      toBlock: 'latest',
    })

    const validBlockHashes = logs.map((log) => log.blockHash).filter((hash): hash is NonNullable<typeof hash> => !!hash)
    const uniqueBlockHashes = [...new Set(validBlockHashes)]
    const missingHashes = uniqueBlockHashes.filter(hash => !blockHashCache.has(hash))
    
    await Promise.all(
      missingHashes.map(async (hash) => {
        const block = await publicClient.getBlock({ blockHash: hash })
        blockHashCache.set(hash, Number(block.timestamp))
      })
    )

    const parsed = logs.map((log) => ({
      sender: log.args.sender as Address,
      message: log.args.message as string,
      timestamp: log.blockHash ? (blockHashCache.get(log.blockHash) ?? 0) : 0,
    }))
    
    setMessages(parsed)
  }, [address, publicClient])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'Message',
    onLogs: () => {
      fetchLogs()
    },
    enabled: !!address,
  })

  return { messages }
}
