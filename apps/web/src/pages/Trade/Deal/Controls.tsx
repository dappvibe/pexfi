import React from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useReadMarketMediator } from '@/wagmi'
import { message, Space, Statistic, Skeleton } from 'antd'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import LoadingButton from '@/components/LoadingButton'
import Feedback from '@/pages/Trade/Deal/Feedback'
import { equal } from '@/utils'
import { DealState } from '@/wagmi/contracts/useDeal'
import { dealAbi, erc20Abi } from '@/wagmi'
import { useAddress } from '@/hooks/useAddress'
import { maxUint256 } from 'viem'

export default function Controls() {
  const { deal, offer } = useDealContext()
  const { address } = useAccount()
  const marketAddress = useAddress('Market#Market')
  const { writeContractAsync } = useWriteContract()
  const { data: mediatorAddress } = useReadMarketMediator({ address: marketAddress })

  const tokenAddress = offer?.token?.address

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && marketAddress ? [address, marketAddress] : undefined,
    query: { enabled: !!tokenAddress && !!address && !!marketAddress },
  })

  if (!address || !offer) return <Skeleton active />

  async function callDeal(
    functionName: 'accept' | 'fund' | 'paid' | 'release' | 'dispute' | 'cancel',
    successMessage: string
  ) {
    try {
      await writeContractAsync({
        address: deal.address,
        abi: dealAbi,
        functionName,
      })
      if (successMessage) message.success(successMessage)
    } catch (e: any) {
      message.error(e?.shortMessage || e?.message || 'Transaction failed')
      throw e
    }
  }

  async function accept() {
    return callDeal('accept', 'Accepted')
  }

  async function fund() {
    if (tokenAddress && marketAddress) {
      if ((allowance ?? 0n) < deal.tokenAmount) {
        await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [marketAddress, maxUint256],
        })
        await refetchAllowance()
      }
    }
    return callDeal('fund', 'Funded')
  }

  const isOwner = () => equal(address, offer.owner)
  const isTaker = () => equal(address, deal.taker)
  const isBuyer = () => (offer.isSell && isTaker()) || (!offer.isSell && isOwner())
  const isSeller = () => (offer.isSell && isOwner()) || (!offer.isSell && isTaker())
  const isMediator = () => equal(address, mediatorAddress)

  const action = {
    countAccept: (
      <span>
        Waiting for acceptance: <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} />
      </span>
    ),
    countFund: (
      <span>
        Waiting for funding: <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} />
      </span>
    ),
    countPaid: (
      <span>
        Waiting for payment: <Statistic.Countdown value={deal.allowCancelUnpaidAfter} />
      </span>
    ),
    countCancel: (
      <span>
        Cancel in <Statistic.Countdown value={deal.allowCancelUnpaidAfter} />
      </span>
    ),
    accept: (
      <LoadingButton type={'primary'} onClick={accept}>
        Accept
      </LoadingButton>
    ),
    fund: (
      <LoadingButton type={'primary'} onClick={fund}>
        Fund
      </LoadingButton>
    ),
    paid: (
      <LoadingButton type={'primary'} onClick={() => callDeal('paid', 'Paid')}>
        Paid
      </LoadingButton>
    ),
    release: (
      <LoadingButton type={'primary'} onClick={() => callDeal('release', 'Released')}>
        Release
      </LoadingButton>
    ),
    dispute: (
      <LoadingButton danger onClick={() => callDeal('dispute', 'Disputed')}>
        Dispute
      </LoadingButton>
    ),
    cancel: (
      <LoadingButton danger onClick={() => callDeal('cancel', 'Canceled')}>
        Cancel
      </LoadingButton>
    ),
  }

  const controls: React.ReactNode[] = []

  switch (deal.state) {
    case DealState.Created:
      if (isOwner()) {
        controls.push(action.accept)
        controls.push(action.cancel)
      }
      if (isTaker()) {
        if (deal.allowCancelUnacceptedAfter > new Date()) {
          controls.push(action.countAccept)
        } else {
          controls.push(action.cancel)
        }
      }
      break

    case DealState.Accepted:
      // Seller cannot cancel after accepting - must fund or wait for timeout
      if (isSeller()) {
        controls.push(action.fund)
      }
      if (isBuyer()) {
        controls.push(action.countFund)
      }
      break

    case DealState.Funded:
      if (isSeller()) {
        if (deal.allowCancelUnpaidAfter > new Date()) {
          controls.push(action.countPaid)
        } else {
          controls.push(action.cancel)
        }
      }
      if (isBuyer()) {
        controls.push(action.paid)
        controls.push(action.cancel)
      }
      break

    case DealState.Paid:
      if (isSeller()) {
        controls.push(action.release)
        controls.push(action.dispute)
      }
      if (isBuyer()) {
        controls.push(action.dispute)
        controls.push(action.cancel)
      }
      break

    case DealState.Disputed:
      if (isSeller()) {
        controls.push(action.release)
        controls.push(action.cancel)
      }
      if (isBuyer()) {
        controls.push(action.cancel)
      }
      if (isMediator()) {
        controls.push(action.release) // resolve for buyer
        controls.push(action.cancel) // resolve for seller
      }
      break

    case DealState.Cancelled:
    case DealState.Resolved:
    case DealState.Released:
      break
  }

  if (deal.state < DealState.Cancelled) {
    return (
      <Space>
        {controls.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </Space>
    )
  } else if (deal.state === DealState.Released || deal.state === DealState.Resolved) {
    // Resolved also allows feedback so that users don't abuse disputes to not have feedback
    return <Feedback />
  } else {
    return null
  }
}
