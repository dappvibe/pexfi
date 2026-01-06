import { useParams } from 'react-router-dom'
import { Col, message, Row, Skeleton } from 'antd'
import React, { createContext, useContext, useEffect, useState } from 'react'
import DealCard from '@/pages/Trade/Deal/DealCard'
import MessageBox from '@/pages/Trade/Deal/MessageBox'
import { useChainId, useWatchContractEvent } from 'wagmi'
import { Deal } from '@/model/Deal.js'
import { useDeal } from '@/hooks/useDeal'
import { useContract } from '@/hooks/useContract'
import { Log, LogDescription } from 'ethers'

export type DealContextValue = {
  deal: Deal
  setDeal: (deal: Deal) => void
  refetch: () => void
}
export const DealContext = createContext<DealContextValue>(null)
export const useDealContext = () => useContext(DealContext)

export default function DealPage() {
  const chainId = useChainId()
  const { dealId } = useParams()
  const { Deal } = useContract()

  // GraphQL query for deal data
  const reply = useDeal(dealId)
  useEffect(() => {
    if (reply.error) {
      console.error(reply.error.message)
      message.error('Failed to load offers')
    }
  }, [reply.error])
  useEffect(() => {
    reply.refetch()
  }, [chainId])

  // hydrate reply
  const [deal, setDeal] = useState<Deal>(null)
  useEffect(() => {
    if (!reply.deal) return
    const deal: any = { ...reply.deal }
    deal.contract = Deal.attach(deal.id)
    deal.state = Number(deal.state)
    deal.allowCancelUnacceptedAfter = new Date(Number(deal.allowCancelUnacceptedAfter) * 1000)
    deal.allowCancelUnpaidAfter = new Date(Number(deal.allowCancelUnpaidAfter) * 1000)
    deal.fiatAmount /= 10 ** 6
    deal.tokenAmount /= 10 ** deal.offer.token.decimals
    setDeal(deal)
  }, [reply.deal])

  /**
   * Listen to events so that the UI is updated when other users interact with the contract.
   */
  useWatchContractEvent({
    address: dealId as `0x${string}`,
    abi: Deal.interface.format(),
    // @ts-ignore incompatible argument types with viem
    onLogs: (logs: Log[]) => {
      // TODO will it wait for confirmation? if yes, update UI after this user's action, not on logs. other users actions come from logs
      logs.forEach((log) => {
        const event: LogDescription = Deal.interface.parseLog(log)
        if (!event) {
          console.error('Failed to parse log', log)
          return
        }
        if (event.name === 'Message') {
          // actual block timestamp is not stricly required here. save bandwidth
          const newDeal = {
            ...deal,
            messages: [
              ...deal.messages,
              {
                createdAt: Math.floor(Date.now() / 1000),
                sender: event.args[0].toLowerCase(),
                message: event.args[1],
              },
            ],
          }
          setDeal(newDeal)
        }
        if (event.name === 'DealState') {
          const newDeal = { ...deal, state: Number(event.args[0]) }
          setDeal(newDeal)
        }
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  if (!deal) return <Skeleton active />
  return (
    <DealContext.Provider value={{ deal, setDeal: setDeal, refetch: reply.refetch }}>
      <Row gutter={5}>
        <Col span={16}>
          <DealCard />
        </Col>
        <Col span={8}>
          <MessageBox />
        </Col>
      </Row>
    </DealContext.Provider>
  )
}
