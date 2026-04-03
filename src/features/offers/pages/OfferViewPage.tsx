import OfferDescription from '@/features/offers/components/OfferDescription'
import CreateDealForm from '@/features/offers/components/CreateDealForm'
import OfferSubnav from '@/features/offers/components/OfferSubnav'
import { useCreateDeal } from '@/features/offers/hooks/useCreateDeal'
import { Helmet } from '@dr.pogodin/react-helmet'
import { useAddress } from '@/shared/web3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Username } from '@/shared/web3'

export default function OfferViewPage() {
  const {
    offer,
    form,
    lockButton,
    submitLabel,
    submitDisabled,
    createDeal,
    syncTokenAmount,
    syncFiatAmount,
  } = useCreateDeal()
  const address = useAddress()

  if (!offer) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-primary animate-pulse font-bold uppercase tracking-[0.4em] text-[10px]">
      <div className="flex gap-3">
         <div className="w-2 h-2 rounded-full bg-primary" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-60" />
         <div className="w-2 h-2 rounded-full bg-primary opacity-30" />
      </div>
      Accessing Protocol Node
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 pb-32">
      <Helmet>
        <title>{offer.token?.symbol} Offer Details - PEXFI</title>
        <meta name="description" content="Detailed trading offer parameters for P2P exchange on PEXFI." />
      </Helmet>

      <div className="flex items-center justify-between">
         <OfferSubnav offer={offer} />
         <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/30">Node ID: {offer.id.slice(0, 12)}...</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
        {/* Left Column: Offer Details */}
        <div className="xl:col-span-2 space-y-12">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center p-3.5 neon-glow">
                    <img src={offer.token?.logo || '/assets/images/logo.png'} className="w-full h-full object-contain" />
                 </div>
                 <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-none">
                      Trade <span className="text-primary">{offer.token?.symbol}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Market Protocol v1.0.4</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-surface-container-low p-10 rounded-[2.5rem] ambient-shadow border-none">
              <OfferDescription offer={offer} />
           </div>
        </div>

        {/* Right Column: Transaction Form */}
        <div className="space-y-8">
           <Card className="surface-container rounded-[2.5rem] border-none overflow-hidden relative ambient-shadow">
             <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

             <CardHeader className="bg-surface-high/20 py-12 px-10 border-b border-white/5 text-center">
               <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">
                 Initialize <span className="text-primary">Deal</span>
               </CardTitle>
               <p className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                 Configure your cryptographic handshake parameters
               </p>
             </CardHeader>

             <CardContent className="p-10 pt-12">
               <CreateDealForm
                  offer={offer}
                  form={form}
                  lockButton={lockButton}
                  submitLabel={submitLabel}
                  submitDisabled={submitDisabled || !address}
                  onFinish={(values) => createDeal(values)}
                  syncTokenAmount={syncTokenAmount}
                  syncFiatAmount={syncFiatAmount}
                />

                {!address && (
                  <div className="mt-8 p-6 bg-surface-lowest rounded-2xl ghost-border flex flex-col items-center text-center gap-4">
                     <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Identity connection required to proceed</span>
                  </div>
                )}
             </CardContent>
           </Card>

           <div className="p-8 bg-surface-container-low rounded-3xl ghost-border space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">Security Protocol</div>
              <p className="text-xs text-on-surface-variant/60 leading-relaxed font-medium">
                Funds are locked in a high-performance smart contract. Resolution is handled via decentralized mediators in case of dispute.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
