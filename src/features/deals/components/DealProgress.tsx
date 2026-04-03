import { useDeal } from '@/features/deals/hooks/useDeal'
import { DealState } from '@/features/deals/hooks/useReadDeal'
import { cn } from '@/lib/utils'

export default function DealProgress() {
  const { deal } = useDeal()

  if (!deal) return null

  const steps = [
    { label: 'Initialization', state: DealState.Initiated },
    { label: 'Handshake', state: DealState.Accepted },
    { label: 'Escrow Funded', state: DealState.Funded },
    { label: 'Peer Paid', state: DealState.Paid },
    { label: 'Settlement', state: DealState.Completed },
  ]

  const currentStepIndex = steps.findIndex(s => s.state === deal.state)
  const isCanceled = deal.state === DealState.Canceled
  const isDisputed = deal.state === DealState.Disputed
  const isResolved = deal.state === DealState.Resolved

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl">
      {/* Visual Line Progress */}
      <div className="flex items-center gap-1 w-full relative h-3 bg-surface-lowest rounded-full ghost-border shadow-inner p-0.5">
         <div
           className={cn(
             "h-full rounded-full transition-all duration-1000",
             isCanceled ? 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]' :
             isDisputed ? 'bg-tertiary shadow-[0_0_8px_rgba(255,184,105,0.5)]' :
             'bg-primary shadow-[0_0_8px_rgba(208,188,255,0.5)]'
           )}
           style={{ width: `${Math.max(((currentStepIndex + 1) / steps.length) * 100, 5)}%` }}
         />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between w-full px-2">
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex
          const isCurrent = idx === currentStepIndex

          return (
            <div key={idx} className="flex flex-col items-center gap-3 group relative">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-500",
                isActive ? (isCanceled ? 'bg-error' : isDisputed ? 'bg-tertiary' : 'bg-primary scale-125 shadow-[0_0_12px_rgba(208,188,255,0.5)]') : 'bg-surface-highest/40'
              )} />
              <div className={cn(
                "text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500",
                isCurrent ? (isCanceled ? 'text-error' : isDisputed ? 'text-tertiary' : 'text-primary') : 'text-on-surface-variant/20'
              )}>
                {step.label}
              </div>

              {isCurrent && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-lowest ghost-border px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-[0.3em] text-white whitespace-nowrap shadow-2xl animate-bounce">
                  Node Active
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(isCanceled || isDisputed || isResolved) && (
        <div className={cn(
          "p-6 rounded-2xl ghost-border text-center text-xs font-bold uppercase tracking-[0.3em]",
          isCanceled ? 'bg-error/10 text-error' :
          isDisputed ? 'bg-tertiary/10 text-tertiary' :
          'bg-primary/10 text-primary'
        )}>
           Protocol Alert: {isCanceled ? 'Agreement Terminated' : isDisputed ? 'Resolution Node Active' : 'Settlement Manually Resolved'}
        </div>
      )}
    </div>
  )
}
