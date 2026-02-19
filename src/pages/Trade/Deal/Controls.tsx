import React from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import {
  dealAbi,
  erc20Abi,
  useReadPexfiVaultBalanceOf,
  useReadPexfiVestingOwner,
  useWritePexfiVestingBond,
} from '@/wagmi'
import { message, Skeleton, Space, Statistic } from 'antd'
import { useDealContext } from '@/pages/Trade/Deal/Deal'
import LoadingButton from '@/components/LoadingButton'
import Feedback from '@/pages/Trade/Deal/Feedback'
import { equal } from '@/utils'
import { DealState } from '@/wagmi/contracts/useDeal'
import { useAddress } from '@/hooks/useAddress'
import { maxUint256, stringToHex } from 'viem'

export default function Controls() {
  const { deal, offer } = useDealContext()
  const { address } = useAccount()
  const marketAddress = useAddress('Market#Market')
  const vaultAddress = useAddress('Market#PexfiVault')
  const vestingAddress = useAddress('Market#PexfiVesting')
  const { writeContractAsync } = useWriteContract()
  const { writeContractAsync: writeBondAsync } = useWritePexfiVestingBond()

  const tokenAddress = offer?.token?.address

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && marketAddress ? [address, marketAddress] : undefined,
    query: { enabled: !!tokenAddress && !!address && !!marketAddress },
  })

  // get isPaid
  const { data: isPaid } = useReadContract({
    address: deal.address,
    abi: dealAbi,
    functionName: 'isPaid',
  })

  const isDisputed = deal.state === DealState.Disputed

  const { data: stPexfiBalance } = useReadPexfiVaultBalanceOf({
    address: vaultAddress,
    args: address ? [address] : undefined,
    query: { enabled: !!vaultAddress && !!address && isDisputed },
  })

  const { data: vestingOwner } = useReadPexfiVestingOwner({
    address: vestingAddress,
    query: { enabled: !!vestingAddress && isDisputed },
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

  const hasEnoughStPexfi = (stPexfiBalance ?? 0n) >= 100000n * 10n ** 18n
  const canResolve = () => hasEnoughStPexfi || equal(address, vestingOwner)

  async function callVesting(args: any[], successMessage: string) {
    if (!vestingAddress) return
    try {
      await writeBondAsync({
        address: vestingAddress,
        args: args as any,
      })
      if (successMessage) message.success(successMessage)
    } catch (e: any) {
      message.error(e?.shortMessage || e?.message || 'Transaction failed')
      throw e
    }
  }

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
    resolvePaid: (
      <LoadingButton
        type={'primary'}
        onClick={() => callVesting([deal.address, stringToHex('PAID')], 'Bonded PAID')}
      >
        Resolve Paid
      </LoadingButton>
    ),
    resolveUnpaid: (
      <LoadingButton
        danger
        onClick={() => callVesting([deal.address, stringToHex('NOT PAID')], 'Bonded NOT PAID')}
      >
        Resolve Unpaid
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
      if (vestingOwner && canResolve()) {
        controls.push(action.resolvePaid)
        controls.push(action.resolveUnpaid)
      }
      break

    case DealState.Resolved:
      if (isPaid) {
        controls.push(action.release)
      } else {
        controls.push(action.cancel)
      }
      break

    case DealState.Cancelled:
    case DealState.Released:
      break
  }

  if (deal.state < DealState.Cancelled || deal.state === DealState.Resolved) {
    return (
      <Space>
        {controls.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </Space>
    )
  } else if (deal.state === DealState.Released) {
    // Resolved also allows feedback so that users don't abuse disputes to not have feedback
    return <Feedback />
  } else {
    return null
  }
}
