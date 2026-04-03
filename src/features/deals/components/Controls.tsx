import React from 'react'
import { useDeal } from '@/features/deals/hooks/useDeal'
import { DealState } from '@/features/deals/hooks/useReadDeal'
import { useConnection, useReadContract, useWriteContract } from 'wagmi'
import { dealAbi, erc20Abi } from '@/wagmi'
import { equal } from '@/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import LoadingButton from '@/shared/ui/components/LoadingButton'
import { useToast } from '@/components/ui/use-toast'
import { maxUint256, stringToHex } from 'viem'
import { cn } from '@/lib/utils'
import { useAddress } from '@/shared/web3'

function CountdownDisplay({ targetDate, label }: { targetDate: Date; label: string }) {
  const [timeLeft, setTimeLeft] = React.useState('')

  React.useEffect(() => {
    const update = () => {
      const now = new Date().getTime()
      const diff = targetDate.getTime() - now
      if (diff <= 0) {
        setTimeLeft('EXPIRED')
        return
      }
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-lowest ghost-border rounded-xl px-8 shadow-inner">
      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40">{label}</span>
        <span className="text-xl font-bold text-white tabular-nums tracking-tighter leading-none">{timeLeft}</span>
      </div>
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(208,188,255,0.5)]" />
    </div>
  )
}

function DealButton({
  dealAddress,
  functionName,
  label,
  variant = 'default',
}: {
  dealAddress: `0x${string}`
  functionName: string
  label: string
  variant?: any
}) {
  const { writeContractAsync, isPending } = useWriteContract()
  const { toast } = useToast()

  async function call() {
    const t = toast({ title: "Executing Handshake", description: "Waiting for wallet confirmation..." })
    try {
      await writeContractAsync({
        address: dealAddress,
        abi: dealAbi,
        functionName: functionName as any,
      })
      t.update({ id: t.id, title: "Protocol Response", description: "Transaction confirmed on-chain." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Execution Error", description: e.shortMessage || "Action failed", variant: "destructive" })
    }
  }

  return (
    <LoadingButton
      variant={variant}
      className={cn("h-16 px-12 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl", variant === 'neon' ? 'neon-glow' : 'ghost-border bg-white/[0.02]')}
      onClick={call}
      loading={isPending}
    >
      {label}
    </LoadingButton>
  )
}

export default function Controls() {
  const { deal, isOwner, isTaker, isSeller, isBuyer, vestingOwner, canResolve, resolvedPaid } = useDeal()
  const { address: account } = useConnection()
  const { writeContractAsync: writeBondAsync } = useWriteContract()
  const { writeContractAsync: writeApproveAsync, isPending: isApproving } = useWriteContract()
  const { toast } = useToast()
  const marketAddress = useAddress('Market#Market')

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: deal?.tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account!, marketAddress!],
    query: { enabled: !!account && !!deal?.tokenAddress && !!marketAddress },
  })

  if (!deal) return null

  const needsApproval = isSeller && deal.state === DealState.Accepted && (!allowance || allowance < BigInt(deal.rawTokenAmount))

  async function approve() {
    if (!marketAddress) return
    const t = toast({ title: "Approving Protocol", description: "Waiting for wallet..." })
    try {
      await writeApproveAsync({
        address: deal!.tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [marketAddress, maxUint256],
      })
      await refetchAllowance()
      t.update({ id: t.id, title: "Node Approved", description: "You can now fund the deal." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Approval Failed", description: e.shortMessage || "Error approving token", variant: "destructive" })
    }
  }

  async function callVesting(args: any[]) {
    if (!deal.vestingAddress) return
    const t = toast({ title: "Bonding Resolution", description: "Waiting for wallet..." })
    try {
      await writeBondAsync({
        address: deal.vestingAddress,
        abi: [
          {
            "inputs": [
              { "internalType": "address", "name": "deal", "type": "address" },
              { "internalType": "bytes32", "name": "result", "type": "bytes32" }
            ],
            "name": "bond",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'bond',
        args: args as any,
      })
      t.update({ id: t.id, title: "Resolution Secured", description: "The finality has been bonded." })
    } catch (e: any) {
      t.update({ id: t.id, title: "Resolution Failed", description: e.shortMessage || "Error bonding resolution", variant: "destructive" })
      throw e
    }
  }

  const action = {
    countAccept: (
      <CountdownDisplay targetDate={deal.allowCancelUnacceptedAfter} label="ACCEPTANCE DEADLINE" />
    ),
    countFund: (
      <CountdownDisplay targetDate={deal.allowCancelUnacceptedAfter} label="FUNDING DEADLINE" />
    ),
    countPaid: (
      <CountdownDisplay targetDate={deal.allowCancelUnpaidAfter} label="PAYMENT DEADLINE" />
    ),
    accept: (
      <DealButton
        dealAddress={deal.address}
        functionName="accept"
        label="Accept Deal Agreement"
        variant="neon"
      />
    ),
    fund: needsApproval ? (
      <LoadingButton variant="neon" className="h-16 px-12 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl neon-glow shadow-xl" onClick={approve} loading={isApproving}>
        Approve Handshake
      </LoadingButton>
    ) : (
      <DealButton
        dealAddress={deal.address}
        functionName="fund"
        label="Fund Protocol Escrow"
        variant="neon"
      />
    ),
    paid: (
      <DealButton
        dealAddress={deal.address}
        functionName="paid"
        label="Confirm Payment Transmitted"
        variant="neon"
      />
    ),
    release: (
      <DealButton
        dealAddress={deal.address}
        functionName="release"
        label="Release Encrypted Assets"
        variant="neon"
      />
    ),
    dispute: (
      <DealButton
        dealAddress={deal.address}
        functionName="dispute"
        label="Escalate to Mediator"
        variant="destructive"
      />
    ),
    cancel: (
      <DealButton
        dealAddress={deal.address}
        functionName="cancel"
        label="Terminate Agreement"
        variant="outline"
      />
    ),
    resolvePaid: (
      <LoadingButton
        variant="neon"
        className="h-16 px-12 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl neon-glow shadow-xl"
        onClick={() => callVesting([deal.address, stringToHex('PAID')])}
      >
        Finalize: PAID
      </LoadingButton>
    ),
    resolveUnpaid: (
      <LoadingButton
        variant="destructive"
        className="h-16 px-12 font-bold uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl"
        onClick={() => callVesting([deal.address, stringToHex('NOT PAID')])}
      >
        Finalize: UNPAID
      </LoadingButton>
    ),
  }

  const controls: React.ReactNode[] = []

  switch (deal.state) {
    case DealState.Initiated:
      if (isOwner) {
        controls.push(action.accept)
        controls.push(action.cancel)
      }
      if (isTaker) {
        if (deal.allowCancelUnacceptedAfter > new Date()) {
          controls.push(action.countAccept)
        } else {
          controls.push(action.cancel)
        }
      }
      break

    case DealState.Accepted:
      if (isSeller) controls.push(action.fund)
      if (isBuyer) controls.push(action.countFund)
      break

    case DealState.Funded:
      if (isSeller) {
        if (deal.allowCancelUnpaidAfter > new Date()) {
          controls.push(action.countPaid)
        } else {
          controls.push(action.cancel)
        }
      }
      if (isBuyer) {
        controls.push(action.paid)
        controls.push(action.cancel)
      }
      break

    case DealState.Paid:
      if (isSeller) {
        controls.push(action.release)
        controls.push(action.dispute)
      }
      if (isBuyer) {
        controls.push(action.dispute)
        controls.push(action.cancel)
      }
      break

    case DealState.Disputed:
      if (isSeller) {
        controls.push(action.release)
        controls.push(action.cancel)
      }
      if (isBuyer) {
        controls.push(action.cancel)
      }
      if (vestingOwner && canResolve()) {
        controls.push(action.resolvePaid)
        controls.push(action.resolveUnpaid)
      }
      break

    case DealState.Resolved:
      if (resolvedPaid) {
        controls.push(action.release)
      } else {
        controls.push(action.cancel)
      }
      break

    case DealState.Canceled:
    case DealState.Completed:
      break
  }

  if (deal.state < DealState.Canceled || deal.state === DealState.Resolved) {
    return (
      <div className="flex flex-wrap items-center gap-6">
        {controls.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </div>
    )
  } else if (deal.state === DealState.Completed) {
    return <Feedback />
  } else {
    return null
  }
}
