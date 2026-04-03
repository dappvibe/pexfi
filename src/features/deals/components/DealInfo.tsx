import { Username } from '@/shared/web3'
import { useDeal } from '@/features/deals/hooks/useDeal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function DealInfo() {
  const { deal, isBuyer, isSeller } = useDeal()

  if (!deal) return null

  const items = [
    { label: 'Counterparty Node', children: <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/10 p-0.5 shadow-inner">
           <AvatarImage src={'https://effigy.im/a/' + (isBuyer ? deal.seller : deal.buyer) + '.svg'} />
           <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Username address={isBuyer ? deal.seller : deal.buyer} profile={deal.profile} className="text-xl font-bold text-white hover:text-primary transition-colors" />
    </div> },
    { label: 'Asset Valuation', children: <div className="flex flex-col gap-1">
        <span className="font-bold text-white text-4xl tracking-tight leading-none tabular-nums">{deal.tokenAmount}</span>
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{deal.token?.symbol}</span>
    </div> },
    { label: 'Settlement Quote', children: <div className="flex flex-col gap-1">
        <span className="text-white font-bold text-3xl leading-none tabular-nums">$ {deal.fiatAmount}</span>
        <span className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.2em]">{deal.fiat} Protocol Value</span>
    </div> },
    { label: 'Handshake Mode', children: <span className="inline-flex items-center gap-2 rounded-xl bg-surface-lowest px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white ghost-border shadow-inner">
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(208,188,255,0.5)]" /> {deal.method}
    </span> },
  ]

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 ml-1">{item.label}</span>
            <div className="flex items-center h-full">{item.children}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-10 bg-surface-lowest/40 rounded-[2rem] ghost-border backdrop-blur-sm relative overflow-hidden group transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 block mb-6">Execution Protocol Instructions</span>
          <p className="text-xl text-on-surface/90 leading-[1.6] italic font-medium">
            "{deal.paymentInstructions || 'No specialized coordination metadata provided for this handshake.'}"
          </p>
        </div>

        <div className="p-10 bg-surface-lowest/40 rounded-[2rem] ghost-border backdrop-blur-sm relative overflow-hidden group transition-all duration-300 border-white/5">
           <div className="absolute top-0 left-0 w-1 h-full bg-tertiary/20" />
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-tertiary block mb-6">Security & Escrow Status</span>
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40">Protocol Escrow Node:</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-white">{deal.state > 2 ? 'FUNDED & LOCKED' : 'WAITING FOR FUNDING'}</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40">Dispute Resolver:</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-white">DECENTRALIZED MEDIATORS</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
