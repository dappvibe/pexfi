import { useDeal } from '@/features/deals/hooks/useDeal.ts'
import { DealState } from '@/features/deals/hooks/useReadDeal'
import { Steps } from 'antd'

export default function DealProgress() {
  const { deal } = useDeal()

  if (!deal) return null

  const items = [
    {
      title: 'Accepting',
      description: 'Counterparty confirms the deal',
    },
    {
      title: 'Funding',
      description: 'Crypto escrowed',
    },
    {
      title: 'Paying',
      description: 'Buyer send fiat',
    },
    {
      title: 'Releasing',
      description: 'Seller send crypto',
    },
  ]

  let current = 0
  let status: 'wait' | 'process' | 'finish' | 'error' = 'process'

  switch (deal.state) {
    case DealState.Initiated:
      current = 0
      break
    case DealState.Accepted:
      current = 1
      break
    case DealState.Funded:
      current = 2
      break
    case DealState.Paid:
      current = 3
      break
    case DealState.Disputed:
      // Map back to the last known "active" step
      current = deal.resolvedPaid ? 3 : 2
      status = 'error'
      break
    case DealState.Resolved:
      current = deal.resolvedPaid ? 3 : 2
      status = 'finish'
      break
    case DealState.Completed:
      current = 4 // All steps finished
      status = 'finish'
      break
    case DealState.Canceled:
      // Keep current step but show error
      current = deal.resolvedPaid ? 3 : 2
      status = 'error'
      break
  }

  return <Steps items={items} current={current} status={status} />
}
