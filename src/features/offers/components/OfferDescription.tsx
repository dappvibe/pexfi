import { Username } from '@/shared/web3'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function OfferDescription({ offer }: { offer: any }) {
  if (!offer) return null

  const items = [
    { label: 'Market Participant', children: <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 border border-white/10 p-0.5">
           <AvatarImage src={'https://effigy.im/a/' + offer.owner + '.svg'} />
           <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Username address={offer.owner} profile={offer.profile} className="text-lg font-bold text-white hover:text-primary transition-colors" />
    </div> },
    { label: 'Asset Valuation', children: <div className="flex flex-col gap-1">
        <span className="font-bold text-white text-3xl tracking-tight leading-none tabular-nums">{offer.price}</span>
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{offer.fiat} / {offer.token?.symbol}</span>
    </div> },
    { label: 'Available Range', children: <div className="flex flex-col gap-1">
        <span className="text-white font-bold text-lg leading-none tabular-nums">$ {offer.min} — $ {offer.max}</span>
        <span className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.2em]">Fiat Liquidity</span>
    </div> },
    { label: 'Payment Gateway', children: <span className="inline-flex items-center gap-2 rounded-xl bg-surface-container-highest px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white ghost-border shadow-inner">
      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(208,188,255,0.5)]" /> {offer.method}
    </span> },
  ]

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40">{item.label}</span>
            <div className="flex items-center">{item.children}</div>
          </div>
        ))}
      </div>

      <div className="p-10 bg-surface-lowest/40 rounded-[2rem] ghost-border backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 block mb-6">Execution Terms & Logistics</span>
        <p className="text-xl text-on-surface/90 leading-[1.6] italic font-medium">
          "{offer.terms || 'No specialized terms provided for this cryptographic exchange.'}"
        </p>
      </div>
    </div>
  )
}
