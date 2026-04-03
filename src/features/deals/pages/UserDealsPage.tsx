import { Link } from 'react-router-dom'
import { useConnection } from 'wagmi'
import { useUserDeals } from '@/features/deals/hooks/useUserDeals'
import { equal } from '@/utils'
import { Helmet } from '@dr.pogodin/react-helmet'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function StateTag({ state }: { state: number }) {
  const labels = ['Initiated', 'Accepted', 'Funded', 'Paid', 'Disputed', 'Canceled', 'Resolved', 'Completed']
  const colors: Record<number, string> = {
    7: 'bg-green-500/10 text-green-500 border-green-500/10',
    4: 'bg-error-container/10 text-error border-error/10',
    5: 'bg-on-surface-variant/10 text-on-surface-variant/40 border-outline-variant/5',
  }

  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] border",
      colors[state] || 'bg-primary/10 text-primary border-primary/10'
    )}>
      {labels[state]}
    </span>
  )
}

function DealItem({ deal }: { deal: any }) {
  const { address } = useConnection()

  function time(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const href = '/trade/deal/' + deal.id
  
  let isBuyer = false
  if (equal(deal.offer.owner, address)) {
    isBuyer = !deal.offer.isSell
  } else if (equal(deal.taker, address)) {
    isBuyer = deal.offer.isSell
  }

  const titleText = `${isBuyer ? 'Buy' : 'Sell'} ${deal.tokenAmountFormatted} ${deal.offer.token.symbol} for ${deal.fiatAmountFormatted} ${deal.offer.fiat} via ${deal.offer.method}`

  return (
    <Link to={href} className="block group">
      <Card className="bg-surface-container-low hover:bg-surface-container transition-all border-none mb-6 group-hover:translate-x-1">
        <CardContent className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">
              {titleText}
            </h3>
            <div className="flex items-center gap-6 text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-[0.2em]">
              <StateTag state={deal.state} />
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                 <span>Initialized {time(deal.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-[0.3em] bg-primary/5 px-6 py-3 rounded-xl ghost-border group-hover:neon-glow transition-all">
            Enter Handshake Terminal
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-3 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function UserDealsPage() {
  const { deals, loading } = useUserDeals()

  if (loading || deals === undefined) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Retrieving History Matrix
    </div>
  )

  if (deals.length === 0) return (
    <div className="max-w-2xl mx-auto py-32 text-center space-y-12 px-6">
       <div className="h-32 w-32 bg-surface-container-low rounded-[2rem] flex items-center justify-center mx-auto text-on-surface-variant/10 ghost-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
       </div>
       <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white tracking-tight">Zero Activity Detected</h2>
          <p className="text-on-surface-variant/60 text-lg max-w-md mx-auto font-medium">No transaction records found on-chain for this protocol identity.</p>
       </div>
       <Link to="/trade/sell" className="inline-block px-12 py-5 bg-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 transition-opacity uppercase tracking-[0.2em] text-[10px] neon-glow">Initialize First Trade</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto py-16 px-6 pb-32">
      <Helmet>
        <title>Transaction history - PEXFI</title>
        <meta name="description" content="Manage your P2P crypto trading deals on PEXFI." />
      </Helmet>
      <div className="mb-16 space-y-3">
         <div className="text-primary text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Node: Transaction Ledger</div>
         <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-none">History</h1>
         <p className="text-on-surface-variant/40 mt-2 font-medium text-lg uppercase tracking-widest">Immutable records of your Cyber-Native exchange</p>
      </div>
      <div className="space-y-2">
        {deals.map((deal: any, i: number) => (
          <DealItem key={i} deal={deal} />
        ))}
      </div>
    </div>
  )
}
