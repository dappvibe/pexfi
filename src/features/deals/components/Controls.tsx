import React from 'react'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  dealAbi,
  erc20Abi,
  useReadPexfiVaultBalanceOf,
  useReadPexfiVestingOwner,
  useSimulateDeal,
  useWritePexfiVestingBond,
} from '@/wagmi'
import { message, Skeleton, Space, Statistic } from 'antd'
import { useDealContext } from '@/features/deals/hooks/useDealContext'
import { LoadingButton } from '@/shared/ui'
import Feedback from '@/features/deals/components/Feedback'
import { equal } from '@/utils'
import { DealState } from '@/wagmi/contracts/useDeal'
import { useAddress } from '@/shared/web3'
import { maxUint256, stringToHex } from 'viem'

interface DealButtonProps {
  dealAddress: `0x${string}`
  functionName: 'accept' | 'fund' | 'paid' | 'release' | 'dispute' | 'cancel'
  label: React.ReactNode
  successMessage?: string
  danger?: boolean
  disabled?: boolean
}

function DealButton({
  dealAddress,
  functionName,
  label,
  successMessage,
  danger,
  disabled,
}: DealButtonProps) {
  const { data, error, isLoading: isSimulating } = useSimulateDeal({
    address: dealAddress,
    functionName,
    abi: [...dealAbi, ...erc20Abi],
    query: {
      retry: false,
    },
  })

  const { writeContractAsync, isPending } = useWriteContract()

  const onClick = async () => {
    if (error) {
      message.error(error.shortMessage || error.message || 'Simulation failed')
      return
    }
    if (!data?.request) {
      return
    }
    try {
      await writeContractAsync(data.request)
      if (successMessage) message.success(successMessage)
    } catch (e: any) {
      message.error(e?.shortMessage || e?.message || 'Transaction failed')
    }
  }

  return (
    <LoadingButton
      type="primary"
      danger={danger}
      loading={isSimulating || isPending}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {label}
    </LoadingButton>
  )
}

export default function Controls() {
  const { deal, offer } = useDealContext()
  const { address } = useAccount()
  const marketAddress = useAddress('Market#Market')
  const vaultAddress = useAddress('Market#PexfiVault')
  const vestingAddress = useAddress('Market#PexfiVesting')

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

  const isOwner = () => equal(address, offer.owner)
  const isTaker = () => equal(address, deal.taker)
  const isBuyer = () => (offer.isSell && isTaker()) || (!offer.isSell && isOwner())
  const isSeller = () => (offer.isSell && isOwner()) || (!offer.isSell && isTaker())

  const hasEnoughStPexfi = (stPexfiBalance ?? 0n) >= 100000n * 10n ** 18n
  const canResolve = () => hasEnoughStPexfi || equal(address, vestingOwner)

  const needsApproval =
    !!tokenAddress && !!marketAddress && (allowance ?? 0n) < deal.tokenAmount

  const { writeContractAsync: approveAsync, data: approveHash } = useWriteContract()
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: !!approveHash },
  })

  async function approve() {
    if (!tokenAddress || !marketAddress) return
    try {
      await approveAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [marketAddress, maxUint256],
      })
      await refetchAllowance()
    } catch (e: any) {
      message.error(e?.shortMessage || e?.message || 'Transaction failed')
    }
  }

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
        Waiting for acceptance:{' '}
        <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} />
      </span>
    ),
    countFund: (
      <span>
        Waiting for funding:{' '}
        <Statistic.Countdown value={deal.allowCancelUnacceptedAfter} />
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
      <DealButton
        dealAddress={deal.address}
        functionName="accept"
        label="Accept"
        successMessage="Accepted"
      />
    ),
    fund: needsApproval ? (
      <LoadingButton type={'primary'} onClick={approve} loading={isApproving}>
        Approve
      </LoadingButton>
    ) : (
      <DealButton
        dealAddress={deal.address}
        functionName="fund"
        label="Fund"
        successMessage="Funded"
      />
    ),
    paid: (
      <DealButton
        dealAddress={deal.address}
        functionName="paid"
        label="Paid"
        successMessage="Paid"
      />
    ),
    release: (
      <DealButton
        dealAddress={deal.address}
        functionName="release"
        label="Release"
        successMessage="Released"
      />
    ),
    dispute: (
      <DealButton
        dealAddress={deal.address}
        functionName="dispute"
        label="Dispute"
        successMessage="Disputed"
        danger
      />
    ),
    cancel: (
      <DealButton
        dealAddress={deal.address}
        functionName="cancel"
        label="Cancel"
        successMessage="Canceled"
        danger
      />
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
