import { generatePath, Link, useParams } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Username } from '@/shared/web3'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useOfferPrice } from '@/features/offers/hooks/useOfferPrice'
import { cn } from '@/lib/utils'

export default function OffersTable({ offers, loading, loadMore, totalOffers }) {
  const { side = 'sell' } = useParams()

  return (
    <div className="flex flex-col gap-10">
      <div className="w-full overflow-hidden rounded-[2rem] bg-surface-container-low p-4 ambient-shadow border-none">
        <Table>
          <TableHeader className="bg-transparent border-none">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em] pl-10 py-8">Asset Liquidity</TableHead>
              <TableHead className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em] py-8">Price Matrix</TableHead>
              <TableHead className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em] py-8">Limits & Range</TableHead>
              <TableHead className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em] py-8">Market Participant</TableHead>
              <TableHead className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.3em] py-8 pr-10 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => {
              const { price, formattedPrice } = useOfferPrice(offer)
              return (
                <TableRow
                  key={offer.id}
                  className="group hover:bg-white/[0.02] border-white/5 transition-all duration-300 relative cursor-default"
                >
                  <TableCell className="pl-10 py-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center p-2.5">
                          <img
                            src={offer.token.logo || '/assets/images/logo.png'}
                            alt={offer.token.symbol}
                            className="w-full h-full object-contain"
                          />
                       </div>
                       <div className="flex flex-col gap-1">
                         <span className="text-lg font-bold text-white tracking-tight leading-none">{offer.token.symbol}</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">{offer.token.name}</span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold text-white tracking-tight leading-none tabular-nums">{formattedPrice}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{offer.fiat.symbol}</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">/ {offer.token.symbol}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-10">
                     <div className="flex flex-col gap-1 text-[12px] font-medium text-on-surface-variant/80">
                        <div className="flex gap-2">
                           <span className="opacity-40 uppercase tracking-widest font-bold text-[9px]">Min:</span>
                           <span className="text-white font-bold tabular-nums">$ {offer.minAmount}</span>
                        </div>
                        <div className="flex gap-2">
                           <span className="opacity-40 uppercase tracking-widest font-bold text-[9px]">Max:</span>
                           <span className="text-white font-bold tabular-nums">$ {offer.maxAmount}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell className="py-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10 p-0.5">
                        <AvatarImage src={'https://effigy.im/a/' + offer.owner + '.svg'} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <Username address={offer.owner} profile={offer.profile} className="text-sm font-bold text-white hover:text-primary transition-colors" />
                        <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-tertiary">
                          <div className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Verified Merchant
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pr-10 py-10 text-right">
                    <Button asChild size="default" variant={side === 'sell' ? 'neon' : 'outline'} className="min-w-[140px] h-12 text-[10px] rounded-xl">
                      <Link to={generatePath('/trade/offer/:id', { id: offer.id })}>
                        {side === 'sell' ? 'Buy Protocol Assets' : 'Sell Protocol Assets'}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {!loading && offers.length === 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={5} className="h-96 text-center border-none">
                  <div className="flex flex-col items-center gap-6 py-20">
                    <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center p-8 ghost-border opacity-40">
                       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white uppercase tracking-widest">No Liquidity Detected</h3>
                       <p className="text-on-surface-variant/40 text-sm max-w-xs mx-auto leading-relaxed">No market offers currently match your selected protocol parameters.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center pb-20">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
            <div className="flex gap-3">
               <div className="w-2 h-2 rounded-full bg-primary" />
               <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
               <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
            </div>
            Scanning Distributed Ledger
          </div>
        ) : (
          (totalOffers !== null && offers.length >= totalOffers) ? (
            <div className="text-on-surface-variant/20 text-[10px] font-bold uppercase tracking-[0.4em] py-4 px-12 border border-white/5 rounded-full">Protocol Status: Synced • {totalOffers} Nodes Found</div>
          ) : (
            <Button onClick={loadMore} variant="outline" className="h-16 px-20 border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
              Request Additional Data
            </Button>
          )
        )}
      </div>
    </div>
  )
}
