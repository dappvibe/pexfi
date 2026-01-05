import { useDealContext } from './Deal'
import { Steps } from 'antd'
import React from 'react'

export default function DealProgress() {
  const { deal } = useDealContext()

  let steps: any = [
    {
      title: 'Accepting',
      description: 'Counterparty confirms the deal',
      status: 'process',
    },
    {
      title: 'Funding',
      description: 'Crypto escrowed',
      status: 'wait',
    },
    {
      title: 'Paying',
      description: 'Buyer send fiat',
      status: 'wait',
    },
    {
      title: 'Releasing',
      description: 'Seller send crypto',
      status: 'wait',
    },
  ]
  if (deal.state >= 1) {
    steps[0] = { status: 'finish', title: 'Accepted' }
    steps[1] = { ...steps[1], status: 'process' }
  }
  if (deal.state >= 2) {
    steps[1] = { status: 'finish', title: 'Funded' }
    steps[2] = { ...steps[2], status: 'process' }
  }
  if (deal.state >= 3) {
    steps[2] = { status: 'finish', title: 'Paid' }
    steps[3] = { ...steps[3], status: 'process' }
  }
  if (deal.state >= 7) {
    steps[3] = { status: 'finish', title: 'Completed' }
  }

  if (deal.state === 5) {
    steps = [{ status: 'finish', title: 'Cancelled' }]
  }

  return <Steps items={steps} />
}
