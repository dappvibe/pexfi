import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useChainId, usePublicClient, useWatchContractEvent } from 'wagmi'
import { dealAbi } from '@/wagmi'

export type Message = {
  sender: Address
  message: string
  timestamp: number
}

export function useDealMessages(address: Address | undefined) {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages([])
  }, [chainId])

  useEffect(() => {
    if (!address || !publicClient) return
    publicClient
      .getLogs({
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
      .then(async (logs) => {
        const blockHashToTimestamp = new Map<string, number>()
        const validBlockHashes = logs.map((log) => log.blockHash).filter((hash): hash is NonNullable<typeof hash> => !!hash)
        const uniqueBlockHashes = [...new Set(validBlockHashes)]
        await Promise.all(
          uniqueBlockHashes.map(async (hash) => {
            const block = await publicClient.getBlock({ blockHash: hash })
            blockHashToTimestamp.set(hash, Number(block.timestamp))
          })
        )

        const parsed = logs.map((log) => ({
          sender: log.args.sender as Address,
          message: log.args.message as string,
          timestamp: log.blockHash ? (blockHashToTimestamp.get(log.blockHash) ?? 0) : 0,
        }))
        setMessages(parsed)
      })
  }, [address, publicClient])

  useWatchContractEvent({
    address,
    abi: dealAbi,
    eventName: 'Message',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { sender, message } = log.args as { sender: Address; message: string }
        setMessages((prev) => [...prev, { sender, message, timestamp: Math.floor(Date.now() / 1000) }])
      })
    },
    enabled: !!address,
  })

  return { messages }
}
